'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('properties', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      property_type: {
        type: Sequelize.ENUM('house', 'apartment', 'office', 'land', 'commercial'),
        allowNull: false
      },
      operation_type: {
        type: Sequelize.ENUM('sale', 'rent', 'transfer'),
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'MXN'
      },
      price_per_sqm: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      bedrooms: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      bathrooms: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      total_bathrooms: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      sq_meters: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      sq_meters_land: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      floors: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
      },
      floor_number: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      parking_spaces: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      year_built: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      condition: {
        type: Sequelize.ENUM('new', 'used', 'construction'),
        allowNull: true
      },
      address: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      neighborhood: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      zip_code: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      location_accuracy: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      amenities: {
        type: Sequelize.JSON,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'sold', 'rented'),
        allowNull: false,
        defaultValue: 'active'
      },
      featured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      views_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      contact_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      last_updated: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Crear índices
    await queryInterface.addIndex('properties', ['user_id'], {
      name: 'idx_properties_user_id'
    });
    await queryInterface.addIndex('properties', ['property_type'], {
      name: 'idx_properties_property_type'
    });
    await queryInterface.addIndex('properties', ['operation_type'], {
      name: 'idx_properties_operation_type'
    });
    await queryInterface.addIndex('properties', ['price'], {
      name: 'idx_properties_price'
    });
    await queryInterface.addIndex('properties', ['status'], {
      name: 'idx_properties_status'
    });
    await queryInterface.addIndex('properties', ['featured'], {
      name: 'idx_properties_featured'
    });
    await queryInterface.addIndex('properties', ['city'], {
      name: 'idx_properties_city'
    });
    await queryInterface.addIndex('properties', ['state'], {
      name: 'idx_properties_state'
    });
    await queryInterface.addIndex('properties', ['bedrooms'], {
      name: 'idx_properties_bedrooms'
    });
    await queryInterface.addIndex('properties', ['bathrooms'], {
      name: 'idx_properties_bathrooms'
    });
    await queryInterface.addIndex('properties', ['sq_meters'], {
      name: 'idx_properties_sq_meters'
    });
    
    // Índice geoespacial compuesto
    await queryInterface.addIndex('properties', ['latitude', 'longitude'], {
      name: 'idx_properties_location'
    });

    // Índice de texto para búsquedas
    await queryInterface.addIndex('properties', ['title', 'description'], {
      name: 'idx_properties_text_search',
      type: 'FULLTEXT'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('properties');
  }
};
