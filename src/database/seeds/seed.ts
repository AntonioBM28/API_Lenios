import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { CategoryOrmEntity } from '../../modules/categories/infrastructure/category.orm-entity';
import { ProductOrmEntity } from '../../modules/products/infrastructure/product.orm-entity';

/**
 * Seed idempotente del catálogo. Usa los mismos datos que el mock del
 * frontend (App_Lenios/src/features/menu/services/mockMenuService.ts)
 * para probar la API con datos reales de inmediato.
 *
 * Uso: npm run seed
 */
const CATEGORIAS_SEED = [
  { nombre: 'Clásicos', descripcion: 'Los favoritos de siempre' },
  { nombre: 'Especiales', descripcion: 'Sabores únicos de temporada' },
];

const PRODUCTOS_SEED = [
  {
    nombre: 'Leño Sabor Salchicha',
    descripcion:
      'Jugosa salchicha artesanal con queso oaxaca, jalapeños y mostaza dijon.',
    precio: 185,
    imagenUrl: 'https://placehold.co/400x300/1C110A/F97316?text=Salchicha',
    categoriaNombre: 'Clásicos',
    disponible: true,
    stock: 20,
    destacado: true,
  },
  {
    nombre: 'Leño de Carne Ahumada',
    descripcion:
      'Carne de res ahumada a fuego lento, pimientos asados y queso manchego.',
    precio: 210,
    imagenUrl: 'https://placehold.co/400x300/1C110A/F97316?text=Carne+Ahumada',
    categoriaNombre: 'Clásicos',
    disponible: true,
    stock: 15,
    destacado: true,
  },
  {
    nombre: 'Leño de Pollo al Pesto',
    descripcion:
      'Pechuga de pollo marinada en pesto de albahaca fresca con queso de cabra.',
    precio: 195,
    imagenUrl: 'https://placehold.co/400x300/1C110A/F97316?text=Pollo+al+Pesto',
    categoriaNombre: 'Clásicos',
    disponible: true,
    stock: 2,
    destacado: false,
  },
  {
    nombre: 'Leño BBQ Texas',
    descripcion:
      'Costilla de cerdo desmechada estilo Texas con salsa BBQ artesanal y cebolla caramelizada.',
    precio: 225,
    imagenUrl: 'https://placehold.co/400x300/1C110A/F97316?text=BBQ+Texas',
    categoriaNombre: 'Especiales',
    disponible: false,
    stock: 0,
    destacado: true,
  },
  {
    nombre: 'Leño Sabor Arrachera',
    descripcion:
      'Arrachera marinada al chipotle con guacamole fresco y pico de gallo.',
    precio: 240,
    imagenUrl: 'https://placehold.co/400x300/1C110A/F97316?text=Arrachera',
    categoriaNombre: 'Especiales',
    disponible: true,
    stock: 8,
    destacado: true,
  },
  {
    nombre: 'Leño Sabor Pollo',
    descripcion:
      'Pollo deshebrado estilo mexicano con crema, queso fresco y epazote.',
    precio: 180,
    imagenUrl: 'https://placehold.co/400x300/1C110A/F97316?text=Pollo',
    categoriaNombre: 'Clásicos',
    disponible: true,
    stock: 18,
    destacado: false,
  },
];

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  const categoryRepo = AppDataSource.getRepository(CategoryOrmEntity);
  const productRepo = AppDataSource.getRepository(ProductOrmEntity);

  const categoriasByNombre = new Map<string, CategoryOrmEntity>();

  for (const data of CATEGORIAS_SEED) {
    let categoria = await categoryRepo.findOne({
      where: { nombre: data.nombre },
    });
    if (!categoria) {
      categoria = await categoryRepo.save(categoryRepo.create(data));
      console.log(`✔ Categoría creada: ${categoria.nombre}`);
    } else {
      console.log(`↷ Categoría ya existe: ${categoria.nombre}`);
    }
    categoriasByNombre.set(categoria.nombre, categoria);
  }

  for (const data of PRODUCTOS_SEED) {
    const existing = await productRepo.findOne({
      where: { nombre: data.nombre },
    });
    if (existing) {
      console.log(`↷ Producto ya existe: ${data.nombre}`);
      continue;
    }

    const categoria = categoriasByNombre.get(data.categoriaNombre);
    if (!categoria) {
      throw new Error(
        `Categoría "${data.categoriaNombre}" no encontrada para seed`,
      );
    }

    await productRepo.save(
      productRepo.create({
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        imagenUrl: data.imagenUrl,
        categoriaId: categoria.id,
        disponible: data.disponible,
        stock: data.stock,
        destacado: data.destacado,
      }),
    );
    console.log(`✔ Producto creado: ${data.nombre}`);
  }

  await AppDataSource.destroy();
  console.log('Seed completado.');
}

seed().catch((error: unknown) => {
  console.error('Error ejecutando el seed:', error);
  process.exit(1);
});
