## 第一步

定义.browserslistrc，获取当前项目所支持的浏览器

## 第二步

去https://github.com/mdn/browser-compat-data.git上面获取vw、vh的支持浏览器列表，

### 支持（vw）

利用自定义插件转换vw、vh

#### 公式

比如设计稿是375

1vw=x/3.75

### 不支持（rem）

公式

https://github.com/amfe/lib-flexible/blob/2.0/index.js

利用自定义插件转换rem

比如设计稿是375

1rem=x/37.5

## 第三步

项目css设置值：

```css
.app-container {
  color: red;
  height: 150opx; //设计稿是多少就设置多少
}
```

