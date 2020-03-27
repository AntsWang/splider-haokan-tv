const Koa = require('koa2'),
    Router = require('koa-router'),
    cheerio = require('cheerio'),
    app = new Koa(),
    router = new Router(),
    superagent = require('superagent'),
    views = require('koa-views'),
    pug = require('pug'),
    path = require('path'),
    http = require('http'),
    fs = require("fs");
require('superagent-charset')(superagent);
const {ctimeArr} = require('./config/index');
// 配置模板文件目录和后缀名
app.use(views(path.join(__dirname + '/views'), {
    extension: 'pug'
})).use(router.routes())
    .use(router.allowedMethods());

router.get('/*', async function (ctx, next) {
    let totalPages = ctx.request.url.split('/')[1] || 20;
    let URL = `https://haokan.baidu.com/author/1611822302181315?_format=json&rn=${totalPages}&ctime=15852823122767&_api=1`;
    let urlArr = [];
    function getUrl(ctime) {
        URL = `https://haokan.baidu.com/author/1611822302181315?_format=json&rn=${totalPages}&ctime=${ctime}&_api=1`;
        return new Promise((resolve) => {
            superagent.get(URL).charset('utf-8').end((err, html) => {
                let text = html && JSON.parse(html.text),
                    $ = cheerio.load(text), url = '', itemArr = text.data.response.results || [], obj = {};
                console.log('html', text);
                itemArr.map(function (items) {
                    let item = items.content;
                    url = item.video_src;
                    console.log("url", url)
                    if (url) {
                        obj = {
                            title: item.title,
                            url: item.video_src
                        }
                        urlArr.push(obj);
                        if (!fs.existsSync(`E:/video/dd/${item.title}.mp4`)) {
                            download(url, item.title);
                        } else {
                            console.log(`电影--${item.title}.mp4已经存在`);
                        }

                    }
                });
                resolve(1);
            })
        })
    }
    console.log('ctimeArr',ctimeArr);
    for (let i = 0; i < ctimeArr.length; i++) {
        await getUrl(ctimeArr[i]);
    }
    await ctx.render('image.pug', {
        "imgUrls": urlArr
    });
})
function download(url, fileName) {
    http.get(url, function (req) {
        var imgData = '';
        req.setEncoding('binary');
        req.on('data', function (chunk) {
            imgData += chunk;
        })
        //req.setEncoding('UTF-8');
        req.on('end', function () {
            try {
                fs.writeFile(`E:/video/dd/${fileName}.mp4`, imgData, 'binary', function (err) {
                    if (err) {
                        console.log('err', err)
                    } else {
                        console.log('视频下载成功', fileName)
                    }

                })
            } catch (e) {
                console.log(e)
            }

        })
    })
}
app.listen(3000, () => {
    console.log('[服务已开启,访问地址为：] http://127.0.0.1:3000/');
});


