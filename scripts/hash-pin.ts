import * as bcrypt from 'bcrypt';

/**
 * Genera el hash bcrypt de un PIN de acceso del admin (RF8), para pegarlo
 * como ADMIN_ACCESS_CODE_HASH en el .env. El PIN en texto plano NUNCA se
 * guarda — ni en el .env, ni en la base de datos, ni en ningún log.
 *
 * Uso:
 *   npm run hash:pin -- <tu-pin>
 *
 * Ejemplo:
 *   npm run hash:pin -- 1234
 */
const SALT_ROUNDS = 12;

async function main(): Promise<void> {
  const pin = process.argv[2];

  if (!pin) {
    console.error('Uso: npm run hash:pin -- <tu-pin>');
    console.error('Ejemplo: npm run hash:pin -- 1234');
    process.exit(1);
  }

  if (pin.length < 4) {
    console.error('El PIN debe tener al menos 4 caracteres.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(pin, SALT_ROUNDS);

  console.log(`\nHash generado (bcrypt, costo ${SALT_ROUNDS}):\n`);
  console.log(hash);
  console.log('\nAgrega esto a tu .env:\n');
  console.log(`ADMIN_ACCESS_CODE_HASH=${hash}`);
  console.log(
    '\nEl PIN en texto plano no se guarda en ningún lado — solo tú lo conoces.\n',
  );
}

main().catch((error: unknown) => {
  console.error('Error generando el hash:', error);
  process.exit(1);
});
