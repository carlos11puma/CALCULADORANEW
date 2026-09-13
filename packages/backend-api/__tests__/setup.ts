// Setup global de pruebas — reflect-metadata debe cargarse antes que
// cualquier decorador de NestJS/class-validator se evalúe (main.ts lo hace
// para el proceso real; las pruebas lo necesitan también para que el
// contenedor de inyección de dependencias resuelva los tipos de parámetro).
import "reflect-metadata";
