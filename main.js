const { app, Notification, Tray, Menu, nativeImage } = require('electron')
const { updateElectronApp } = require('update-electron-app');
const axios = require('axios')
const escpos = require('escpos')
escpos.USB = require('escpos-usb')
require('dotenv').config()
updateElectronApp()

if (require('electron-squirrel-startup'))
    app.quit()

const AppSecret = process.env.APP_SECRET;
const poll = (device, printer) => {
    axios.get('https://fikspizza.ru/api/receipts', {
        headers: {
            'X-App-Secret': AppSecret
        }
    }).then(
        (response) => {

            response.data?.orders?.forEach(order => {
                new Notification({
                    title: 'Печать чека',
                    body: order,
                    icon: nativeImage.createFromPath('./assets/img/icon.png'),
                }).show()
            })

            device?.open(function (error){

                response.data?.orders?.forEach(order => {
                    printer.text(order)
                    this.cut()
                })

                this.close()

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

    // const device  = new escpos.USB(0x76c, 0x0302)
    // const printer = new escpos.Printer(device, {encoding: 'utf8'})

    setInterval(poll/*.bind(device, printer)*/, 1000)

})