# JSONTOEXCEL
> ## 使用说明
+ 用于浏览器端将数组对象格式数据导出xls/xlsx/csv 格式文件；

> ## API

+ JSONTOEXCEL.exportFile(dataSource:Array\<any\>, fileName:string, columns:Array<{title:string,dataIndex?:string,computed?:function}>)

> ## function 

+ 支持cvs/xls/xlsx三种格式
+ 自动根据文件名称中后缀识别导出格式
+ 支持自定义列头，columns为数组
    + title **必填** 为列头展示的名称
    + dataIndex **可选** 字段名称
    + computed **可选** 计算属性函数 

> ## example
```javascript
  var dataSource = [{
        name: '胡彦斌',
        age: 32,
        address: '西湖区湖底公园1号'
      }, {
        name: '胡彦祖',
        age: 42,
        address: '西湖区湖底公园1号'
      }],

      columns = columns = [{
        title: '姓名',
        dataIndex: 'name'
      }, {
        title: '年龄',
        dataIndex: 'age',
      }, {
        title: '住址',
        dataIndex: 'address'
      }, {
        title: '出生年份',
        computed: function (item) {
          return 2017 - item.age
        }
      }]

  JSONEXPORT.exportFile(dataSource, 'test.xls', columns)
  
  // columns 可以选填
  // 不填时，默认将dataSource的第一行数据key值作为表头
  JSONEXPORT.exportFile(dataSource, 'test.xlsx')
  
  JSONEXPORT.exportFile(dataSource, 'test.csv', columns)
  
```



> ## change log


+ v 0.1.0
  + feature 支持计算属性 computed；
  + update api优化；
  
