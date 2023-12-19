module.exports = {
  url: process.env.NODE_ENV === 'development' ? '' : 'https://dev2.bnjm.eu',
  currentYear() {const today = new Date();return today.getFullYear();}
};