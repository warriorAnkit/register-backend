const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
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

  Post.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    referenceType: {
      type: DataTypes.ENUM('VIDEO', 'EPISODE', 'POST', 'NEWS_ARTICLE'),
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    text: {
      type: DataTypes.TEXT,
    },
    image: {
      type: DataTypes.STRING,
    },
    mediaDimensions: {
      type: DataTypes.JSONB,
    },
    createdBy: {
      type: DataTypes.INTEGER,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    underscored: true,
    timestamps: true,
    paranoid: true,
    modelName: 'Post',
    tableName: 'posts',
  });

  // eslint-disable-next-line no-unused-vars
  Post.associate = models => {
    Post.belongsTo(models.Person, {
      as: 'creator',
      foreignKey: 'createdBy',
      targetKey: 'id',
    });
    Post.belongsTo(models.Person, {
      as: 'postUpdater',
      foreignKey: 'updatedBy',
      targetKey: 'id',
    });
    Post.hasMany(models.Comment, {
      foreignKey: 'postId',
      sourceKey: 'id',
    });
  };

  return Post;
};
