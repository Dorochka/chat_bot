//Создаем объект Telegraf и присваиваем ему модуль telegraf
const { ConsoleMessage } = require('puppeteer');
const { Telegraf, Markup, extra, Context } = require('telegraf');
//Создаем объект бот объекта телеграф и передаем АПИ
const config = require('./config');
const recep = require('./rec_dips.json');


function main_menu() {
    return Markup.keyboard([
        ["Завтрак"],
        ["Обед"],
        ["Ужин"]
    ]).resize();
}

function choice() {
    return Markup.keyboard([
        ["Другой рецепт", "Вернуться"]
    ]).resize();
}

function choice_recep() {
    return Markup.keyboard([
        ["Следующий рецепт", "Вернуться"]
    ]).resize();
}

function vern() {
    return Markup.keyboard([
        ["Вернуться"]
    ]).resize();
}

function raspred() {
    zavt = [];
    obed = [];
    yzin = [];
    for (i = 0; i < recep.length; i++)
        switch (recep[i]['status']) {
            case ('brea'): zavt.push(recep[i])
                break;
            case ('lunch'): obed.push(recep[i])
                break;
            case ('dinn'): yzin.push(recep[i])
                break;
            default: console.log("Chek JSON")
                break;
        }
}

function nach(mas1, cont) {
    vuvod_ing(mas1, 0, cont)
    setTimeout(() => cont.reply('Если хотите вернуться к выбору типа блюда нажмите "Вернуться", а если хотите другой рецепт, нажмите "Другой рецепт"', choice()), 1000)
    mas1.splice(0, 1)
}

function drug(mas2, cont) {
    if (mas2.length != 0) {
        sluch = Math.floor(Math.random() * mas2.length)
        vuvod_ing(mas2, sluch, cont)
        mas2.splice(sluch,1)
    }
    else cont.reply("Извините, я больше не знаю, что Вам предложить в данном разделе, мои рецепты закончились(", vern())
}

function vuvod_ing(arr, num, cont1) {
    yes = arr[num].name + '\n\n'
    masing = (String(arr[num].ingredient)).split(",")
    for (i = 0; i < masing.length; i++) {
        yes = yes + '✔' + masing[i] + '\n'
    }
    yes = yes + '\n\nПолный рецепт можете посмотреть по ссылке:' + arr[num].href
    cont1.replyWithPhoto(arr[num].pic, {
        caption: yes
    })
}

async function found_ingr(vvedingr, cont) {
    vvedingr = String(vvedingr)
    vvedingr = vvedingr.split(", ")
    masit = []
    recep1 = recep
    for (i = 0; i < recep1.length; i++) {
        countsovp = 0
        masingr = []
        masingr = (String(recep1[i]['ingredient'])).split(",")
        for (j = 0; j < masingr.length; j++) {
            for (d = 0; d < vvedingr.length; d++) {
                ime = String(masingr[j])
                ime = ime.toLowerCase()
                nyz = String(vvedingr[d])
                nyz = nyz.toLowerCase()
                if (ime.indexOf(nyz) !== -1)
                    countsovp = countsovp + 1
            }
        }
        if (countsovp == vvedingr.length)
            masit.push(recep1[i]['href'])
    }
    mas_podh_nazv = []
    mas_podh_nazv = found_nazv(vvedingr)
    masit = masit.concat(mas_podh_nazv)
    if (masit.length == 0)
        cont.reply("Извините, я не знаю подходящих рецептов😞\n\nПопробуйте проверить правильность написания продуктов")
    else
        for (i = 0; i < recep1.length; i++) {
            if (recep1[i]['href'] == masit[0]) {
                await vuvod_ing(recep1, i, cont)
                masit.splice(0,1)
                setTimeout(() => cont.reply('Если хотите вернуться в главное меню нажмите "Меню", а если хотите посмотреть следующий рецепт, нажмите "Следующий рецепт"', choice_recep()), 1000)
                break
            }
        }
    return masit
}

function sled(mas, cont) {
    recep2 = recep
    if (mas.length != 0) {
        for (ic = 0; ic < recep2.length; ic++) {
            if (recep2[ic]['href'] == mas[0]) {
                vuvod_ing(recep2, ic, cont)
                mas.splice(0, 1)
                break
            }
        }
    }
    else cont.reply("Извините, я больше не знаю, что Вам предложить, мои рецепты закончились(", vern())
}

function found_nazv(arra) {
    arra = String(arra)
    arra = arra.split(" ")
    itmasnazv = []
    for (i = 0; i < recep.length; i++) {
        countsovp = 0
        masnazv = []
        masnazv = (String(recep[i]['name'])).split(" ")
        for (j = 0; j < masnazv.length; j++) {
            for (d = 0; d < arra.length; d++) {
                ime = String(masnazv[j])
                ime = ime.toLowerCase()
                nyz = String(arra[d])
                nyz = nyz.toLowerCase()
                if (ime.indexOf(nyz) !== -1)
                    countsovp = countsovp + 1
            }
        }
        if (countsovp == arra.length)
            itmasnazv.push(recep[i]['href'])
    }
    return itmasnazv
}

function drugou(no, cont) {
    if (no == "Завтрак") drug(zavt, cont)
    else if (no == "Обед") drug(obed, cont)
    else if (no == "Ужин") drug(yzin, cont)
}

dada = []
const bot = new Telegraf(config.Token);
raspred();
var oredel;
priv = 'Добро пожаловать!\nЯ Бот-Кулинар и я:\n✔Подскажу Вам, что приготовить на завтрак, обед или ужин;\n✔Смогу подобрать блюдо по имеющимся у Вас ингредиентам;\n✔Найти рецепт определенного блюда.\n\nДля более подробно инструкции работы с ботом введите /help';
bot.start((ctx) => ctx.reply(priv, main_menu()))
bot.help((ctx) => ctx.replyWithHTML(`Доброго времени суток, <i>${ctx.from.first_name}</i>
\nВы можете просто ввести наименовние блюда или ингредиенты через запятую в поле ввода сообщения, отправить мне это сообщение и я постараюсь найти что-нибудь именно для Вас. Для перехода к следующему рецепту просто нажмите "Следующий рецепт"
\nТакже ниже представлена клавиатура с выбором типа блюда: Завтрак, Обед или Ужин. Выберите и нажмите на то, что хотите приготовить. Бот предложит Вам блюдо из выбранно категории.
\nЕсли вы ошиблись с выбором категории блюда, нажмите "Вернуться" на клавиатуре снизу.
\nЕсли Вам не понравится предложенное Ботом блюдо, нажимайте "Другой рецепт" на клавиатуре снизу, пока не найдете понравившееся Вам блюдо. Когда у Бота закончатся рецепты, которые он может Вам предложить, он сообщит  вам об этом.`, main_menu()))
bot.on('sticker', (ctx) => ctx.reply('Классный стикер'))
bot.on('voice', (ctx) => ctx.reply('Я пока не умею реагировать на голосовые сообщения'))
bot.on('text', (ctx) => {
    switch (ctx.message.text) {
        case ("Завтрак"): oredel = "Завтрак"; nach(zavt, ctx); break;
        case ("Обед"): oredel = "Обед"; nach(obed, ctx); break;
        case ("Ужин"): oredel = "Ужин"; nach(yzin, ctx); break;
        case ("Вернуться"): ctx.reply('Выберите тип блюда еще раз', main_menu()); raspred(); break;
        case ("Следующий рецепт"): sled(dada, ctx); break;
        case ("Другой рецепт"): drugou(oredel, ctx); break;
        default:
            dada.length = 0;
            dada = found_ingr(ctx.message.text, ctx); break;
    }
}
)
bot.launch();
