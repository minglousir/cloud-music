export const formatNumber = (num) => {
      let number = num/10000
      if(number > 1 && number < 100) {
        number = number.toFixed(1) + '万'
      } else if(number > 100) {
        number = Math.floor(number) + '万'
      } else if(number >= 10000) {
        number = (number/10000).toFixed(1) + '亿'
      } else {
        number = num
      }
      return number+""
}
