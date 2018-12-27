let Utility = new(function () {

    this.getRandomInt = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    this.addDays = function (date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    this.calculateDeadline = function (date1, date2) {
        var delta = Math.abs(date2 - date1) / 1000;
        var days = Math.floor(delta / 86400);
        delta -= days * 86400;
        var hours = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;
        var minutes = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;
        var deadline = days + "D : " + hours + "H : " + minutes + "M"
        return deadline;
    }

});

module.exports = Utility;