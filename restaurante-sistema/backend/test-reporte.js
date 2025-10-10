const Reporte = require('./models/Reporte');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('          PRUEBA DE REPORTES CON DATOS REALES            ');
console.log('═══════════════════════════════════════════════════════════\n');

// Probar con diferentes rangos de fechas
const pruebas = [
  { nombre: 'HOY (2025-10-10)', inicio: '2025-10-10', fin: '2025-10-10' },
  { nombre: 'AYER (2025-10-09)', inicio: '2025-10-09', fin: '2025-10-09' },
  { nombre: 'ÚLTIMOS 3 DÍAS', inicio: '2025-10-08', fin: '2025-10-10' },
  { nombre: 'ÚLTIMOS 7 DÍAS', inicio: '2025-10-04', fin: '2025-10-10' },
];

pruebas.forEach(prueba => {
  console.log(`\n┌─────────────────────────────────────────────────────────┐`);
  console.log(`│  ${prueba.nombre.padEnd(55, ' ')}│`);
  console.log(`│  Período: ${prueba.inicio} a ${prueba.fin}        │`);
  console.log(`└─────────────────────────────────────────────────────────┘\n`);

  try {
    const resultado = Reporte.historialVentas(prueba.inicio, prueba.fin);

    console.log('📊 RESUMEN:');
    console.log(`   • Total Mesas: ${resultado.resumen.total_mesas}`);
    console.log(`   • Total Pedidos: ${resultado.resumen.total_pedidos}`);
    console.log(`   • Ingresos Totales: S/ ${resultado.resumen.total_ingresos.toFixed(2)}`);
    console.log(`   • Promedio por Mesa: S/ ${resultado.resumen.promedio_por_mesa.toFixed(2)}`);

    console.log('\n📅 VENTAS POR FECHA:');
    if (resultado.ventas_por_fecha.length > 0) {
      resultado.ventas_por_fecha.forEach(venta => {
        console.log(`   ${venta.fecha}: ${venta.mesas_atendidas} mesas, ${venta.total_pedidos} pedidos → S/ ${venta.total_ventas.toFixed(2)}`);
      });
    } else {
      console.log('   ⚠️  No hay ventas en este período');
    }

    console.log('\n🍽️  DETALLE DE VENTAS:');
    if (resultado.ventas_detalladas.length > 0) {
      resultado.ventas_detalladas.forEach(venta => {
        console.log(`\n   Mesa ${venta.mesa_numero} - ${new Date(venta.fecha_cierre).toLocaleString('es-PE')}`);
        console.log(`   Total: S/ ${venta.total_venta.toFixed(2)} (${venta.total_pedidos} pedidos)`);

        if (venta.productos && venta.productos.length > 0) {
          console.log('   Productos:');
          venta.productos.forEach(p => {
            const variante = p.variante ? ` (${p.variante})` : '';
            const notas = p.notas ? ` - ${p.notas}` : '';
            console.log(`      • ${p.producto}${variante}: ${p.cantidad} x S/ ${p.precio_unitario.toFixed(2)} = S/ ${p.subtotal.toFixed(2)}${notas}`);
          });
        }
      });
    } else {
      console.log('   ⚠️  No hay ventas detalladas en este período');
    }

    console.log('\n🔥 TOP PRODUCTOS:');
    if (resultado.productos_mas_vendidos.length > 0) {
      resultado.productos_mas_vendidos.forEach((prod, idx) => {
        console.log(`   ${idx + 1}. ${prod.nombre} (${prod.categoria}): ${prod.cantidad_vendida} unidades → S/ ${prod.total_generado.toFixed(2)}`);
      });
    } else {
      console.log('   ⚠️  No hay productos vendidos en este período');
    }

  } catch (error) {
    console.error(`   ❌ ERROR: ${error.message}`);
  }

  console.log('\n' + '─'.repeat(61));
});

console.log('\n✅ Pruebas completadas\n');
