const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PostLike extends Model {
    /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      // define association here
    }
  }

  PostLike.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    postId: {
      type: DataTypes.INTEGER,
    },
    personId: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: 'PostLike',
    tableName: 'post_like',
  });

  PostLike.associate = models => {
    PostLike.belongsTo(models.Post, {
      foreignKey: 'postId',
      targetKey: 'id',
    });
    PostLike.belongsTo(models.Person, {
      foreignKey: 'personId',
      targetKey: 'id',
    });
  };

  return PostLike;
};
