const { app, Notification, Tray, Menu, nativeImage } = require('electron')
const axios = require('axios')
require('dotenv').config()

const escpos = require('escpos')
escpos.USB = require('escpos-usb')

console.log(escpos.USB.findPrinter())

const { updateElectronApp } = require('update-electron-app');
updateElectronApp()

if (require('electron-squirrel-startup'))
    app.quit()

const AppSecret = process.env.APP_SECRET;
const poll = (device, printer) => {
    axios.get('https://fiks-pizza.ru/api/receipts', {
        headers: {
            'X-App-Secret': AppSecret
        }
    }).then(
        (response) => {

            response.data?.new_orders?.forEach(order => {
                new Notification({
                    title: 'Новый заказ',
                    body: order,
                    icon: nativeImage.createFromPath('./assets/img/icon.png'),
                }).show()
            })

            device?.open(function (error){

                response.data?.orders?.forEach(order => {
                    printer.text(order)
                    printer.cut()
                })

                printer.close()

            });

        },
        (error) => console.error(error.code)
    )
}

app.whenReady().then(() => {

    const icon = nativeImage.createFromPath('./assets/img/icon.png')
    const tray = new Tray(icon)
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Выход', type: 'normal', role: 'quit' },
    ])

    tray.setContextMenu(contextMenu)
    tray.setToolTip('Fix Pizza Printer')

    const device  = new escpos.USB(0x076c, 0x0302)
    const printer = new escpos.Printer(device, {encoding: 'cp866'})

    setInterval(() => poll(device, printer), 1000)

})