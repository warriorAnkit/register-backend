const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GlobalTemplate extends Model { }

  GlobalTemplate.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'GlobalTemplate',
    tableName: 'global_template',
    underscored: true,
    paranoid: true,
    timestamps: true,
  });

  GlobalTemplate.associate = models => {
    GlobalTemplate.hasMany(models.GlobalTemplateField, {
      as: 'fields',
      foreignKey: 'globalTemplateId',
    });
    GlobalTemplate.hasMany(models.GlobalTemplateProperty, {
      as: 'properties',
      foreignKey: 'globalTemplateId',
    });
  };

  return GlobalTemplate;
};
