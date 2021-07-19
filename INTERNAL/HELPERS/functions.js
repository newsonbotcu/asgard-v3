const low = require('lowdb');
module.exports = {

    comparedate(date) {
        let now = new Date();
        let diff = now.getTime() - date.getTime();
        let days = Math.floor(diff);
        return days;
    },
    checkSecs(date) {
        let now = new Date();
        let diff = now.getTime() - date.getTime();
        let days = Math.floor(diff / 1000);
        return days / 60;
    },
    checkMins(date) {
        let now = new Date();
        let diff = now.getTime() - date.getTime();
        let secs = Math.floor(diff / 60000);
        return secs;
    },

    // This function sort an array 
    sortByKey(array, key) {
        return array.sort(function (a, b) {
            let x = a[key];
            let y = b[key];
            return ((x < y) ? 1 : ((x > y) ? -1 : 0));
        });
    },

    // This function return a shuffled array
    shuffle(pArray) {
        let array = [];
        pArray.forEach(element => array.push(element));
        let currentIndex = array.length, temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    },

    randomNum(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },
    rain(client, sayi) {
        const emojis = low(client.adapters('emojis')).get("numbers").value();
        var basamakbir = sayi.toString().replace(/ /g, "     ");
        var basamakiki = basamakbir.match(/([0-9])/g);
        basamakbir = basamakbir.replace(/([a-zA-Z])/g, "bilinmiyor").toLowerCase();
        if (basamakiki) {
            basamakbir = basamakbir.replace(/([0-9])/g, d => {
                return {
                    "0": emojis.sfr,
                    "1": emojis.bir,
                    "2": emojis.iki,
                    "3": emojis.uch,
                    "4": emojis.drt,
                    "5": emojis.bes,
                    "6": emojis.alt,
                    "7": emojis.ydi,
                    "8": emojis.sks,
                    "9": emojis.dkz
                }[d];
            });
        }
        return basamakbir;
    },

    sayi(anan) {
        var reg = new RegExp("^\\d+$");
        var valid = reg.test(anan);
        return valid;
    },

    checkDays(date) {
        let now = new Date();
        let diff = now.getTime() - date.getTime();
        let days = Math.floor(diff / 86400000);
        return days;
    },

    checkHours(date) {
        let now = new Date();
        let diff = now.getTime() - date.getTime();
        let days = Math.floor(diff / 3600000);
        return days;
    },

    getPath(obj, value, path) {

        if (typeof obj !== 'object') {
            return;
        }

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                var t = path;
                var v = obj[key];
                if (!path) {
                    path = key;
                }
                else {
                    path = path + '.' + key;
                }
                if (v === value) {
                    return path.toString();
                }
                else if (typeof v !== 'object') {
                    path = t;
                };
                var res = this.sayi(v, value, path);
                if(res) {
                    return res;
                } 
            }
        }

    },

    async closeall(obj, permes) {
        obj.roles.cache.filter(rol => rol.editable).filter(r => r.id !== "856264412476997672").filter(rol => permes.some(xd => rol.permissions.has(xd))).forEach(async (rol) => {
            const pValue = rol.permissions.remove(permes.filter(perm => rol.permissions.has(perm)));
            console.log(pValue);
            await rol.setPermissions(pValue);
        });
    },

};

