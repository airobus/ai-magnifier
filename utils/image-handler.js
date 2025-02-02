// 图片处理相关的工具类
class ImageHandler {
  // 打开相机拍照
  static takePhoto() {
    return new Promise((resolve, reject) => {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['camera'],
        camera: 'back',
        success: (res) => {
          resolve(res.tempFiles[0].tempFilePath)
        },
        fail: (err) => {
          if (err.errMsg.indexOf('auth deny') !== -1) {
            this.handleAuthDeny('camera')
          }
          // 如果是用户取消操作，则不触发reject
          if (err.errMsg.indexOf('cancel') === -1) {
            reject(err)
          }
        }
      })
    })
  }

  // 从相册选择
  static chooseFromAlbum() {
    return new Promise((resolve, reject) => {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album'],
        success: (res) => {
          resolve(res.tempFiles[0].tempFilePath)
        },
        fail: (err) => {
          if (err.errMsg.indexOf('auth deny') !== -1) {
            this.handleAuthDeny('album')
          }
          // 如果是用户取消操作，则不触发reject
          if (err.errMsg.indexOf('cancel') === -1) {
            reject(err)
          }
        }
      })
    })
  }

  // 处理权限拒绝
  static handleAuthDeny(type) {
    const scopeType = type === 'camera' ? '相机' : '相册'
    wx.showModal({
      title: '提示',
      content: `需要您授权使用${scopeType}，是否去设置？`,
      success: (res) => {
        if (res.confirm) {
          wx.openSetting()
        }
      }
    })
  }

  // 图片转base64
  static imageToBase64(imagePath) {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath: imagePath,
        encoding: 'base64',
        success: res => resolve(res.data),
        fail: err => reject(err)
      })
    })
  }
}

export default ImageHandler