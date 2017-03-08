const formats = {
  formats: {
    date: {
      default: {
        format: 'D.M.YYYY',
      }
    },
    number: {
      default: {
        precision: 10
      },
      currency: {
        unit: '$'
      },
      percentage: {
        template: '%n %'
      }
    }
  }
};

export default formats;
