const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TableResponse extends Model {}

  TableResponse.init({
    setId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tableFieldId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'TableResponse',
    tableName: 'table_response',
    underscored: true,
    paranoid: true,
    timestamps: true,
  });
  TableResponse.associate = models => {
    TableResponse.belongsTo(models.Set, {
      as: 'set',
      foreignKey: 'setId',
      targetKey: 'id',
    });

    TableResponse.belongsTo(models.TableField, {
      as: 'field',
      foreignKey: 'tableFieldId',
      targetKey: 'id',
    });
  };

  return TableResponse;
};
