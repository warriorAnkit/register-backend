const { Model } = require('sequelize');

const encryption = require('../../../utils/auth/encryption');

module.exports = (sequelize, DataTypes) => {
  class AccessToken extends Model {
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

  AccessToken.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER, // Change from STRING to INTEGER
      autoIncrement: true, 
    },
    personId: {
      type: DataTypes.INTEGER,
    },
    tokenType: {
      type: DataTypes.ENUM('ACCESS', 'RESET'),
      defaultValue: 'ACCESS',
    },
    token: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('token');
        console.log('Getting token:', rawValue);
        const decryptedToken = encryption.decryptWithAES(rawValue);
        return decryptedToken;
      },
      set(value) {
        // console.log('Setting token:', value);
        const encryptedToken = encryption.encryptWithAES(value);
        // console.log('encrtypetds token',encryptedToken);
        this.setDataValue('token', encryptedToken);
      },
    },
    client: {
      type: DataTypes.STRING,
    },
    deviceId: {
      type: DataTypes.STRING,
    },
    os: {
      type: DataTypes.STRING,
    },
    expiredAt: {
      type: DataTypes.DATE,
    },
    metaData: {
      type: DataTypes.JSONB,
    },
  }, {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: 'AccessToken',
    tableName: 'access_tokens',
    indexes: [
      {
        unique: true,
        fields: ['person_id', 'token'],
      },
    ],
  });

  AccessToken.associate = models => {
    AccessToken.belongsTo(models.Person, {
      as: 'person',
      foreignKey: 'personId',
      targetKey: 'id',
    });
  };

  return AccessToken;
};
