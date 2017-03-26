Zing Gallery
============

基于node.js的web相册，让摄影照片的展示更加简单
Web albums based on node.js, more simple to show photography photos

### 1、功能

此[Demo](http://litten.me/gallery/)供体验。
扫码可体验Mobile交互：

![zing-galler qrcode](https://cloud.githubusercontent.com/assets/2024949/19653457/3ad5df14-9a47-11e6-8f2f-b9ae3241c6b6.png)

* 自动获取照片信息（快门、光圈、ISO、时间等）
* 自由为相册设置信息（封面、名称、描述）
* 相册可加密访问
* 适配PC与移动侧展示
* 移动侧可使用多指手势操控图片，与原生图库一般流畅

### 2、外观

#### PC-常规

![](https://cloud.githubusercontent.com/assets/2024949/19653136/ea05893c-9a45-11e6-9e6c-6ef8879e1df1.png)

#### PC-照片展示

![](https://cloud.githubusercontent.com/assets/2024949/19653268/7ac9106a-9a46-11e6-845d-0f78e8d7e0b2.png)

#### Mobile-照片展示

![](https://cloud.githubusercontent.com/assets/2024949/19653432/18bbe77a-9a47-11e6-830b-e3929e6e9f17.png)

#### Mobile-手势说明

![](https://cloud.githubusercontent.com/assets/2024949/19653657/eb6aba66-9a47-11e6-92de-565d07b38c77.png)

### 3、使用

相册基于node & npm，所以这两个工具必不可少。

1. 将照片放入``resources/photos``文件夹
2. 执行命令``npm i``安装依赖
3. 执行命令``npm run start``启动相册

### 4、高级用法

#### 4.1 设置全局信息

编辑``config.js``文件

```
module.exports = {
	title: 'Zing Gallery',					// 相册名
	wording: {
		noAccess: '抱歉，你没有权限访问'		// 无权限访问的提示
	},
	albums: {								// 相册信息，在文档4.2中详解
		"贵阳": {
			thumbnail : "IMG_0331.JPG",
			sort: 1
		}, 
		"千户苗寨": {
			description : "没有什么能够阻挡",
			thumbnail : "IMG_0424.jpg",
			name: "千户苗寨"
		},
		"私密": {
			description : "私密",
			name: "私密 | 密码是233",
			password: "233",
			passwordTips: "密码是233"
		}
	}
}
```

#### 4.2 设置相册信息

比如有一个叫xxx的相册，它的位置应该是``resources/photos/xxx``

编辑``config.js``文件的``albums``字段，增加一个``xxx``的对象，可以为其设置相册信息：

```
albums: {
	"贵阳": {},
	"千户苗寨": {},
	"私密": {},
	"xxx" : {
		"description" : "1983年小巷12月晴朗……",     // 该相册的描述；如果没有，则不展示
		"thumbnail" : "IMG_0424.jpg",             // 封面图；如果没有，则默认取第一张作为封面
		"name": "第七章",                          // 相册名；如果没有，则相册名为xxx
		"password": "233",						  // 私密相册，密码为233
		"passwordTips": "密码是233"				// 密码提示
		"noDate": false,                          // 不展示时间；如果为true，则不展示照片时间信息；默认没有，即false
		"sort": 1								  // 排序；为1时是时间逆序；默认或不填是时间正序
	}
}

```


### 5、前端开发者

如果你是前端开发者，需要做一些页面上的定制，你需要使用webpack进行开发。

执行命令``npm run dev``（不压缩，一般开发时用）或``npm run dist``（压缩）

将``assets/src``里的源文件编译到``assets/dist``目录。
