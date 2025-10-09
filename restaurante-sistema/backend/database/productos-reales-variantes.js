const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new Database(dbPath);

const productosReales = [
  // CEVICHES
  {
    nombre: 'Ceviche A lo Javier',
    categoria: 'Ceviches',
    variantes: [
      { tamano: 'Personal', precio: 20.00 },
      { tamano: 'Mediano', precio: 30.00 },
      { tamano: 'Familiar', precio: 40.00 }
    ]
  },
  {
    nombre: 'Ceviche A la Luana',
    categoria: 'Ceviches',
    variantes: [
      { tamano: 'Personal', precio: 25.00 },
      { tamano: 'Mediano', precio: 35.00 },
      { tamano: 'Familiar', precio: 45.00 }
    ]
  },
  {
    nombre: 'Ceviche de Mero',
    categoria: 'Ceviches',
    variantes: [
      { tamano: 'Personal', precio: 30.00 },
      { tamano: 'Mediano', precio: 40.00 },
      { tamano: 'Familiar', precio: 50.00 }
    ]
  },
  {
    nombre: 'Ceviche de Cabrillón',
    categoria: 'Ceviches',
    variantes: [
      { tamano: 'Personal', precio: 30.00 },
      { tamano: 'Mediano', precio: 40.00 },
      { tamano: 'Familiar', precio: 50.00 }
    ]
  },
  {
    nombre: 'Ceviche de Conchas negras',
    categoria: 'Ceviches',
    variantes: [
      { tamano: 'Personal', precio: 25.00 },
      { tamano: 'Mediano', precio: 35.00 },
      { tamano: 'Familiar', precio: 45.00 }
    ]
  },
  {
    nombre: 'Ceviche de Langostino',
    categoria: 'Ceviches',
    variantes: [
      { tamano: 'Personal', precio: 25.00 },
      { tamano: 'Mediano', precio: 35.00 },
      { tamano: 'Familiar', precio: 45.00 }
    ]
  },
  {
    nombre: 'Ceviche de Filete + Conchas',
    categoria: 'Ceviches',
    variantes: [
      { tamano: 'Personal', precio: 30.00 },
      { tamano: 'Mediano', precio: 40.00 },
      { tamano: 'Familiar', precio: 50.00 }
    ]
  },
  {
    nombre: 'Ceviche de Filete',
    categoria: 'Ceviches',
    variantes: [
      { tamano: 'Personal', precio: 15.00 },
      { tamano: 'Mediano', precio: 25.00 },
      { tamano: 'Familiar', precio: 35.00 }
    ]
  },
  {
    nombre: 'Ceviche se salió el mar',
    categoria: 'Ceviches',
    variantes: [
      { tamano: 'Personal', precio: 25.00 },
      { tamano: 'Mediano', precio: 35.00 },
      { tamano: 'Familiar', precio: 45.00 }
    ]
  },
  {
    nombre: 'Ceviche Mixto',
    categoria: 'Ceviches',
    variantes: [
      { tamano: 'Personal', precio: 25.00 },
      { tamano: 'Mediano', precio: 35.00 },
      { tamano: 'Familiar', precio: 45.00 }
    ]
  },
  {
    nombre: 'Ceviche Filete + caballa',
    categoria: 'Ceviches',
    variantes: [
      { tamano: 'Personal', precio: 20.00 },
      { tamano: 'Mediano', precio: 30.00 },
      { tamano: 'Familiar', precio: 40.00 }
    ]
  },
  {
    nombre: 'Ceviche de Caballa',
    categoria: 'Ceviches',
    variantes: [
      { tamano: 'Personal', precio: 10.00 },
      { tamano: 'Mediano', precio: 20.00 },
      { tamano: 'Familiar', precio: 30.00 }
    ]
  },
  {
    nombre: 'Ceviche Tricolor',
    categoria: 'Ceviches',
    variantes: [
      { tamano: 'Personal', precio: 30.00 },
      { tamano: 'Mediano', precio: 40.00 },
      { tamano: 'Familiar', precio: 50.00 }
    ]
  },
  {
    nombre: 'Ceviche mero + Conchas',
    categoria: 'Ceviches',
    variantes: [
      { tamano: 'Personal', precio: 40.00 },
      { tamano: 'Mediano', precio: 50.00 },
      { tamano: 'Familiar', precio: 60.00 }
    ]
  },
  {
    nombre: 'Ceviche Cabrillón + Conchas',
    categoria: 'Ceviches',
    variantes: [
      { tamano: 'Personal', precio: 40.00 },
      { tamano: 'Mediano', precio: 50.00 },
      { tamano: 'Familiar', precio: 60.00 }
    ]
  },
  {
    nombre: '4 Ceviches',
    categoria: 'Ceviches',
    variantes: [
      { tamano: 'Personal', precio: 40.00 },
      { tamano: 'Mediano', precio: 50.00 },
      { tamano: 'Familiar', precio: 60.00 }
    ]
  },
  {
    nombre: 'Ceviche de pota',
    categoria: 'Ceviches',
    variantes: [
      { tamano: 'Personal', precio: 15.00 },
      { tamano: 'Mediano', precio: 25.00 },
      { tamano: 'Familiar', precio: 35.00 }
    ]
  },

  // PARRILLADA
  {
    nombre: 'Parrillada de Pollo',
    categoria: 'Parrillada',
    variantes: [
      { tamano: 'Único', precio: 15.00 }
    ]
  },
  {
    nombre: 'Parrillada de Chancho',
    categoria: 'Parrillada',
    variantes: [
      { tamano: 'Único', precio: 18.00 }
    ]
  },
  {
    nombre: 'Parrillada de Res',
    categoria: 'Parrillada',
    variantes: [
      { tamano: 'Único', precio: 20.00 }
    ]
  },

  // SUDADOS
  {
    nombre: 'Sudado de Mero',
    categoria: 'Sudados',
    variantes: [
      { tamano: 'Personal', precio: 30.00 },
      { tamano: 'Mediano', precio: 40.00 },
      { tamano: 'Familiar', precio: 50.00 }
    ]
  },
  {
    nombre: 'Sudado de Cabrillón',
    categoria: 'Sudados',
    variantes: [
      { tamano: 'Personal', precio: 30.00 },
      { tamano: 'Mediano', precio: 40.00 },
      { tamano: 'Familiar', precio: 50.00 }
    ]
  },
  {
    nombre: 'Sudado de Cabrilla',
    categoria: 'Sudados',
    variantes: [
      { tamano: 'Personal', precio: 28.00 },
      { tamano: 'Mediano', precio: 38.00 },
      { tamano: 'Familiar', precio: 48.00 }
    ]
  },
  {
    nombre: 'Parihuela de Cabrillón',
    categoria: 'Sudados',
    variantes: [
      { tamano: 'Personal', precio: 30.00 },
      { tamano: 'Mediano', precio: 40.00 },
      { tamano: 'Familiar', precio: 50.00 }
    ]
  },
  {
    nombre: 'Parihuela de Cabrilla',
    categoria: 'Sudados',
    variantes: [
      { tamano: 'Personal', precio: 28.00 },
      { tamano: 'Mediano', precio: 38.00 },
      { tamano: 'Familiar', precio: 48.00 }
    ]
  },
  {
    nombre: 'Parihuela de Mero',
    categoria: 'Sudados',
    variantes: [
      { tamano: 'Personal', precio: 30.00 },
      { tamano: 'Mediano', precio: 40.00 },
      { tamano: 'Familiar', precio: 50.00 }
    ]
  },

  // PASADOS
  {
    nombre: 'Pasado de Mero',
    categoria: 'Pasados',
    variantes: [
      { tamano: 'Personal', precio: 30.00 },
      { tamano: 'Mediano', precio: 40.00 },
      { tamano: 'Familiar', precio: 50.00 }
    ]
  },
  {
    nombre: 'Pasado de Cabrilla',
    categoria: 'Pasados',
    variantes: [
      { tamano: 'Personal', precio: 28.00 },
      { tamano: 'Mediano', precio: 28.00 },
      { tamano: 'Familiar', precio: 48.00 }
    ]
  },
  {
    nombre: 'Pasado de Cabrillón',
    categoria: 'Pasados',
    variantes: [
      { tamano: 'Personal', precio: 30.00 },
      { tamano: 'Mediano', precio: 40.00 },
      { tamano: 'Familiar', precio: 50.00 }
    ]
  },
  {
    nombre: 'Pasado de Caballa',
    categoria: 'Pasados',
    variantes: [
      { tamano: 'Personal', precio: 15.00 },
      { tamano: 'Mediano', precio: 25.00 },
      { tamano: 'Familiar', precio: 35.00 }
    ]
  },

  // MARISCOS
  {
    nombre: 'Ronda Marina',
    categoria: 'Mariscos',
    variantes: [
      { tamano: 'Personal', precio: 40.00 },
      { tamano: 'Mediano', precio: 50.00 },
      { tamano: 'Familiar', precio: 60.00 }
    ]
  },
  {
    nombre: 'Arroz con mariscos',
    categoria: 'Mariscos',
    variantes: [
      { tamano: 'Personal', precio: 20.00 },
      { tamano: 'Mediano', precio: 30.00 },
      { tamano: 'Familiar', precio: 40.00 }
    ]
  },
  {
    nombre: 'Chaufa de Mariscos',
    categoria: 'Mariscos',
    variantes: [
      { tamano: 'Personal', precio: 20.00 },
      { tamano: 'Mediano', precio: 30.00 },
      { tamano: 'Familiar', precio: 40.00 }
    ]
  },
  {
    nombre: 'Chaufa de Pescado',
    categoria: 'Mariscos',
    variantes: [
      { tamano: 'Personal', precio: 15.00 },
      { tamano: 'Mediano', precio: 25.00 },
      { tamano: 'Familiar', precio: 35.00 }
    ]
  },
  {
    nombre: 'Arroz c/ Langostinos',
    categoria: 'Mariscos',
    variantes: [
      { tamano: 'Personal', precio: 25.00 },
      { tamano: 'Mediano', precio: 35.00 },
      { tamano: 'Familiar', precio: 45.00 }
    ]
  },
  {
    nombre: 'Majariscos',
    categoria: 'Mariscos',
    variantes: [
      { tamano: 'Personal', precio: 25.00 },
      { tamano: 'Mediano', precio: 35.00 },
      { tamano: 'Familiar', precio: 45.00 }
    ]
  },

  // CHICHARRÓN
  {
    nombre: 'Chicharrón de Pescado',
    categoria: 'Chicharrón',
    variantes: [
      { tamano: 'Personal', precio: 15.00 },
      { tamano: 'Mediano', precio: 25.00 },
      { tamano: 'Familiar', precio: 35.00 }
    ]
  },
  {
    nombre: 'Chicharrón Mixto',
    categoria: 'Chicharrón',
    variantes: [
      { tamano: 'Personal', precio: 20.00 },
      { tamano: 'Mediano', precio: 35.00 },
      { tamano: 'Familiar', precio: 45.00 }
    ]
  },
  {
    nombre: 'Chicharrón de Langostinos',
    categoria: 'Chicharrón',
    variantes: [
      { tamano: 'Personal', precio: 30.00 },
      { tamano: 'Mediano', precio: 40.00 },
      { tamano: 'Familiar', precio: 50.00 }
    ]
  },
  {
    nombre: 'Chicharrón de Pollo',
    categoria: 'Chicharrón',
    variantes: [
      { tamano: 'Personal', precio: 20.00 },
      { tamano: 'Mediano', precio: 30.00 },
      { tamano: 'Familiar', precio: 40.00 }
    ]
  },
  {
    nombre: 'Chicharrón de Pota',
    categoria: 'Chicharrón',
    variantes: [
      { tamano: 'Personal', precio: 15.00 },
      { tamano: 'Mediano', precio: 25.00 },
      { tamano: 'Familiar', precio: 35.00 }
    ]
  },

  // JALEAS
  {
    nombre: 'Jalea de Mero',
    categoria: 'Jaleas',
    variantes: [
      { tamano: 'Personal', precio: 30.00 },
      { tamano: 'Mediano', precio: 40.00 },
      { tamano: 'Familiar', precio: 50.00 }
    ]
  },
  {
    nombre: 'Jalea de Cabrillón',
    categoria: 'Jaleas',
    variantes: [
      { tamano: 'Personal', precio: 30.00 },
      { tamano: 'Mediano', precio: 40.00 },
      { tamano: 'Familiar', precio: 50.00 }
    ]
  },
  {
    nombre: 'Jalea de Cabrilla',
    categoria: 'Jaleas',
    variantes: [
      { tamano: 'Personal', precio: 28.00 },
      { tamano: 'Mediano', precio: 38.00 },
      { tamano: 'Familiar', precio: 48.00 }
    ]
  },
  {
    nombre: 'Jalea Mixta',
    categoria: 'Jaleas',
    variantes: [
      { tamano: 'Personal', precio: 30.00 },
      { tamano: 'Mediano', precio: 40.00 },
      { tamano: 'Familiar', precio: 50.00 }
    ]
  },

  // CARNES
  {
    nombre: 'Ronda Criolla',
    categoria: 'Carnes',
    variantes: [
      { tamano: 'Personal', precio: 40.00 },
      { tamano: 'Mediano', precio: 50.00 },
      { tamano: 'Familiar', precio: 60.00 }
    ]
  },
  {
    nombre: 'Ronda mar y tierra',
    categoria: 'Carnes',
    variantes: [
      { tamano: 'Familiar', precio: 70.00 }
    ]
  },
  {
    nombre: 'Seco de Chavelo',
    categoria: 'Carnes',
    variantes: [
      { tamano: 'Personal', precio: 20.00 },
      { tamano: 'Mediano', precio: 30.00 },
      { tamano: 'Familiar', precio: 40.00 }
    ]
  },
  {
    nombre: 'Costilla de Chancho c/patacones',
    categoria: 'Carnes',
    variantes: [
      { tamano: 'Personal', precio: 20.00 },
      { tamano: 'Mediano', precio: 30.00 },
      { tamano: 'Familiar', precio: 40.00 }
    ]
  },
  {
    nombre: 'Costilla de Chancho + seco Chavelo',
    categoria: 'Carnes',
    variantes: [
      { tamano: 'Personal', precio: 35.00 },
      { tamano: 'Mediano', precio: 45.00 },
      { tamano: 'Familiar', precio: 55.00 }
    ]
  },
  {
    nombre: 'Carne Seca',
    categoria: 'Carnes',
    variantes: [
      { tamano: 'Personal', precio: 25.00 },
      { tamano: 'Mediano', precio: 35.00 },
      { tamano: 'Familiar', precio: 45.00 }
    ]
  },
  {
    nombre: 'Carne Mixtas',
    categoria: 'Carnes',
    variantes: [
      { tamano: 'Personal', precio: 30.00 },
      { tamano: 'Mediano', precio: 40.00 },
      { tamano: 'Familiar', precio: 50.00 }
    ]
  },
  {
    nombre: 'Majado de Yuca + chancho',
    categoria: 'Carnes',
    variantes: [
      { tamano: 'Personal', precio: 25.00 },
      { tamano: 'Mediano', precio: 35.00 },
      { tamano: 'Familiar', precio: 45.00 }
    ]
  },
  {
    nombre: 'Carne al jugo',
    categoria: 'Carnes',
    variantes: [
      { tamano: 'Personal', precio: 25.00 },
      { tamano: 'Mediano', precio: 35.00 },
      { tamano: 'Familiar', precio: 45.00 }
    ]
  },

  // COMBINADOS
  {
    nombre: 'Arroz c/ mariscos + ceviche',
    categoria: 'Combinados',
    variantes: [
      { tamano: 'Personal', precio: 25.00 },
      { tamano: 'Mediano', precio: 35.00 },
      { tamano: 'Familiar', precio: 45.00 }
    ]
  },
  {
    nombre: 'Chaufa mariscos + ceviche',
    categoria: 'Combinados',
    variantes: [
      { tamano: 'Personal', precio: 25.00 },
      { tamano: 'Mediano', precio: 35.00 },
      { tamano: 'Familiar', precio: 45.00 }
    ]
  },
  {
    nombre: 'Chicharrón + Ceviche',
    categoria: 'Combinados',
    variantes: [
      { tamano: 'Personal', precio: 25.00 },
      { tamano: 'Mediano', precio: 35.00 },
      { tamano: 'Familiar', precio: 45.00 }
    ]
  },
  {
    nombre: 'Chicharrón + Arroz c/ mariscos',
    categoria: 'Combinados',
    variantes: [
      { tamano: 'Personal', precio: 30.00 },
      { tamano: 'Mediano', precio: 40.00 },
      { tamano: 'Familiar', precio: 50.00 }
    ]
  },

  // BEBIDAS
  {
    nombre: 'Cerveza Cristal',
    categoria: 'Bebidas',
    variantes: [{ tamano: 'Único', precio: 8.00 }]
  },
  {
    nombre: 'Cerveza Pilsen',
    categoria: 'Bebidas',
    variantes: [{ tamano: 'Único', precio: 9.00 }]
  },
  {
    nombre: 'Cuzqueña Trigo',
    categoria: 'Bebidas',
    variantes: [{ tamano: 'Único', precio: 10.00 }]
  },
  {
    nombre: 'Cuzqueña Negra',
    categoria: 'Bebidas',
    variantes: [{ tamano: 'Único', precio: 10.00 }]
  },
  {
    nombre: 'Cuzqueña Dorada',
    categoria: 'Bebidas',
    variantes: [{ tamano: 'Único', precio: 10.00 }]
  },
  {
    nombre: 'Cerveza Corona',
    categoria: 'Bebidas',
    variantes: [{ tamano: 'Único', precio: 8.00 }]
  },
  {
    nombre: 'Cerveza Stella Artois',
    categoria: 'Bebidas',
    variantes: [{ tamano: 'Único', precio: 5.00 }]
  },
  {
    nombre: 'Cerveza Budweiser',
    categoria: 'Bebidas',
    variantes: [{ tamano: 'Único', precio: 5.00 }]
  },
  {
    nombre: 'Agua Mineral',
    categoria: 'Bebidas',
    variantes: [{ tamano: 'Único', precio: 3.00 }]
  },
  {
    nombre: 'Inka Kola',
    categoria: 'Bebidas',
    variantes: [
      { tamano: '1 Lt', precio: 6.00 },
      { tamano: '1 1/2 Lt', precio: 8.00 },
      { tamano: '2 Lt', precio: 10.00 },
      { tamano: '2 1/2 Lt', precio: 15.00 }
    ]
  },
  {
    nombre: 'Coca Cola',
    categoria: 'Bebidas',
    variantes: [
      { tamano: 'Personal', precio: 2.50 },
      { tamano: '1 Lt', precio: 6.00 },
      { tamano: '1 1/2 Lt', precio: 8.00 },
      { tamano: '2 Lt', precio: 10.00 },
      { tamano: '2 1/2 Lt', precio: 15.00 }
    ]
  },
  {
    nombre: 'Chicha morada',
    categoria: 'Bebidas',
    variantes: [{ tamano: 'Jarra', precio: 8.00 }]
  },
  {
    nombre: 'Maracuya',
    categoria: 'Bebidas',
    variantes: [{ tamano: 'Jarra', precio: 8.00 }]
  },
  {
    nombre: 'Clarito',
    categoria: 'Bebidas',
    variantes: [{ tamano: 'Jarra', precio: 6.00 }]
  },

  // ESPECIALIDADES
  {
    nombre: 'Leche de Tigre',
    categoria: 'Especialidades',
    variantes: [{ tamano: 'Único', precio: 10.00 }]
  },
  {
    nombre: 'Leche de Pantera',
    categoria: 'Especialidades',
    variantes: [{ tamano: 'Único', precio: 15.00 }]
  },
  {
    nombre: 'Porción de Patacones',
    categoria: 'Especialidades',
    variantes: [{ tamano: 'Único', precio: 6.00 }]
  },
  {
    nombre: 'Aguadito',
    categoria: 'Especialidades',
    variantes: [{ tamano: 'Único', precio: 3.00 }]
  },
  {
    nombre: 'Caldo de Gallina',
    categoria: 'Especialidades',
    variantes: [{ tamano: 'Único', precio: 12.00 }]
  },
  {
    nombre: 'Mondonguito',
    categoria: 'Especialidades',
    variantes: [{ tamano: 'Único', precio: 8.00 }]
  },
  {
    nombre: 'Cabrillón en salsa de langostino',
    categoria: 'Especialidades',
    variantes: [
      { tamano: 'Personal', precio: 35.00 },
      { tamano: 'Mediano', precio: 45.00 },
      { tamano: 'Familiar', precio: 55.00 }
    ]
  }
];

function migrarProductos() {
  try {
    console.log('🔄 Iniciando migración de productos...');

    // Eliminar datos existentes
    db.exec('DELETE FROM pedido_items');
    db.exec('DELETE FROM pedidos');
    db.exec('DELETE FROM producto_variantes');
    db.exec('DELETE FROM productos');
    db.exec('DELETE FROM mesas');
    
    console.log('✅ Datos antiguos eliminados');

    // Insertar mesas
    const insertMesa = db.prepare('INSERT INTO mesas (numero, estado) VALUES (?, ?)');
    for (let i = 1; i <= 10; i++) {
      insertMesa.run(i.toString(), 'libre');
    }
    console.log('✅ 10 mesas creadas');

    // Insertar productos y variantes
    const insertProducto = db.prepare(
      'INSERT INTO productos (nombre, categoria, disponible) VALUES (?, ?, ?)'
    );
    const insertVariante = db.prepare(
      'INSERT INTO producto_variantes (producto_id, tamano, precio) VALUES (?, ?, ?)'
    );

    let totalProductos = 0;
    let totalVariantes = 0;

    productosReales.forEach(producto => {
      const result = insertProducto.run(producto.nombre, producto.categoria, 1);
      const productoId = result.lastInsertRowid;
      totalProductos++;

      producto.variantes.forEach(variante => {
        insertVariante.run(productoId, variante.tamano, variante.precio);
        totalVariantes++;
      });
    });

    console.log(`✅ ${totalProductos} productos creados`);
    console.log(`✅ ${totalVariantes} variantes creadas`);
    console.log('🎉 Migración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    throw error;
  } finally {
    db.close();
  }
}

migrarProductos();