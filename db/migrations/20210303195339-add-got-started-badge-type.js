'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const icon = '<path d="M8.0001 0.666748C8.25385 0.666748 8.48559 0.810796 8.5979 1.03833L10.5029 4.89773L14.7632 5.52042C15.0142 5.55712 15.2227 5.73312 15.3009 5.97446C15.3792 6.2158 15.3137 6.48063 15.1319 6.65765L12.0498 9.65966L12.7772 13.9007C12.8201 14.1508 12.7172 14.4036 12.5119 14.5528C12.3066 14.7019 12.0344 14.7216 11.8098 14.6035L8.0001 12.6L4.1904 14.6035C3.96579 14.7216 3.6936 14.7019 3.48828 14.5528C3.28296 14.4036 3.18013 14.1508 3.22303 13.9007L3.95042 9.65966L0.868279 6.65765C0.686533 6.48063 0.621018 6.2158 0.69927 5.97446C0.777522 5.73312 0.985975 5.55712 1.23702 5.52042L5.49726 4.89773L7.4023 1.03833C7.51461 0.810796 7.74635 0.666748 8.0001 0.666748ZM8.0001 2.83958L6.53791 5.80183C6.44088 5.9984 6.25342 6.1347 6.03652 6.16641L2.76571 6.64448L5.13192 8.94918C5.28917 9.10234 5.36095 9.32309 5.32384 9.53944L4.76555 12.7945L7.6898 11.2567C7.88405 11.1545 8.11615 11.1545 8.3104 11.2567L11.2346 12.7945L10.6764 9.53944C10.6393 9.32309 10.711 9.10234 10.8683 8.94918L13.2345 6.64448L9.96368 6.16641C9.74678 6.1347 9.55932 5.9984 9.4623 5.80183L8.0001 2.83958Z" transform="translate(40, 6)" fill="white"/>'
    const newBadgeTypeSql = `INSERT INTO public."BadgeTypes" (code, icon, "createdAt", "updatedAt", "title", "description", "criteria")	VALUES ('gotStarted', '${icon}', NOW(), NOW(), 'Got Started', 'Shows that the developer created an account at Merico', 'Create an account with Merico');`
    try {
      await queryInterface.sequelize.query(newBadgeTypeSql)
    } catch (error) {
      console.log('INFO: badge already exists')      
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DELETE FROM public."BadgeTypes" WHERE code = \'gotStarted\'')
  }
}
