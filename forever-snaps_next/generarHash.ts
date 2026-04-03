const bcrypt = require('bcryptjs');

const miContrasena = 'AccesoAdmin2026'; // <--- ESTA SERÁ TU CONTRASEÑA
const hash = bcrypt.hashSync(miContrasena, 10);

console.log('=== COPIA ESTO AL .env ===');
console.log(hash);