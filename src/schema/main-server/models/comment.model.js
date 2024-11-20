const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
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

  Comment.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    comment: {
      type: DataTypes.STRING,
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    mediaType: {
      type: DataTypes.ENUM('IMAGE', 'GIF'),
    },
    mediaDimensions: {
      type: DataTypes.JSONB,
    },
    mediaUrl: {
      type: DataTypes.STRING,
    },
    giphyId: {
      type: DataTypes.STRING,
    },
    postId: {
      type: DataTypes.INTEGER,
    },
    parentId: {
      type: DataTypes.INTEGER,
    },
    createdBy: {
      type: DataTypes.INTEGER,
    },
    deletedBy: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    underscored: true,
    timestamps: true,
    paranoid: true,
    modelName: 'Comment',
    tableName: 'comments',
  });

  Comment.associate = models => {
    Comment.belongsTo(models.Person, {
      as: 'commentCreator',
      foreignKey: 'createdBy',
      targetKey: 'id',
    });
    Comment.belongsTo(models.Person, {
      as: 'commentDelete',
      foreignKey: 'deletedBy',
      targetKey: 'id',
    });
    Comment.belongsTo(models.Post, {
      as: 'post',
      foreignKey: 'postId',
      targetKey: 'id',
    });
    Comment.hasOne(models.Comment, {
      as: 'parentComment',
      foreignKey: 'parentId',
      targetKey: 'id',
    });
  };

  return Comment;
};
