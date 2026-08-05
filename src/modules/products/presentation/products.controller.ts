import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from '../../auth/presentation/guards/admin.guard';
import { ListProductsUseCase } from '../application/use-cases/list-products.use-case';
import { GetProductByIdUseCase } from '../application/use-cases/get-product-by-id.use-case';
import { CreateProductUseCase } from '../application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../application/use-cases/update-product.use-case';
import { UpdateStockUseCase } from '../application/use-cases/update-stock.use-case';
import { DeleteProductUseCase } from '../application/use-cases/delete-product.use-case';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { AuditContext } from '../../../common/decorators/audit-context.decorator';
import { RequestAuditContext } from '../../../common/interceptors/request-context.interceptor';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly updateStockUseCase: UpdateStockUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lista el catálogo de productos',
    description:
      'Sin filtros devuelve TODOS los productos (activos e inactivos), usado tanto por ' +
      'el catálogo público (RF1) como por el panel admin. Usa ?disponible=true para que ' +
      'el catálogo público pida solo los disponibles.',
  })
  @ApiResponse({ status: 200, type: ProductResponseDto, isArray: true })
  async findAll(
    @Query() query: ListProductsQueryDto,
  ): Promise<ProductResponseDto[]> {
    const productos = await this.listProductsUseCase.execute({
      categoriaId: query.categoriaId,
      disponible: query.disponible,
    });
    return productos.map((producto) => ProductResponseDto.fromDomain(producto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un producto por id' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductResponseDto> {
    const producto = await this.getProductByIdUseCase.execute(id);
    return ProductResponseDto.fromDomain(producto);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crea un nuevo producto' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'La categoría indicada no existe' })
  async create(
    @Body() dto: CreateProductDto,
    @AuditContext() ctx: RequestAuditContext,
  ): Promise<ProductResponseDto> {
    const producto = await this.createProductUseCase.execute(dto, ctx.ip);
    return ProductResponseDto.fromDomain(producto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualiza un producto existente' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({ status: 400, description: 'La categoría indicada no existe' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @AuditContext() ctx: RequestAuditContext,
  ): Promise<ProductResponseDto> {
    const producto = await this.updateProductUseCase.execute(id, dto, ctx.ip);
    return ProductResponseDto.fromDomain(producto);
  }

  @Patch(':id/stock')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ajusta el stock de un producto (panel admin)',
    description:
      'Aplica la regla de disponibilidad automática: si el stock llega a 0 el producto ' +
      'se marca no disponible; si sube de 0 a positivo, vuelve a estar disponible.',
  })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockDto,
    @AuditContext() ctx: RequestAuditContext,
  ): Promise<ProductResponseDto> {
    const producto = await this.updateStockUseCase.execute(id, dto, ctx.ip);
    return ProductResponseDto.fromDomain(producto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina un producto' })
  @ApiResponse({ status: 204, description: 'Producto eliminado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @AuditContext() ctx: RequestAuditContext,
  ): Promise<void> {
    await this.deleteProductUseCase.execute(id, ctx.ip);
  }
}
