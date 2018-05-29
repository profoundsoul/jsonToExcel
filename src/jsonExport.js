/*
 * @Author: changge
 * @Date: 2017-08-15 11:07:05
 * @Last Modified by: changge
 * @Last Modified time: 2018-01-22 17:49:31
 */
(function (global) {
    'use strict'
    var JSONEXPORT = (function () {

        var defaultFileSuffix = 'xls'

        var EXPORT_TYPES = {
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            csv: 'application/csv'
        }
        var EXPORT_TYPES_FN = (function () {
            this.jsonToExcel = (function () {
                var xlsTemp = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta name=ProgId content=Excel.Sheet> <meta name=Generator content="Microsoft Excel 11"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>${table}</table></body></html>'
                return function (dataSource, columns) {
                    var excelData = '',
                      excelHeader = []
                    excelData += '<thead>'
                    columns.forEach(function (item) {
                        excelData += '<th>' + item.title + '</th>'
                        if (item.computed && typeof item.computed === 'function') {
                            excelHeader.push(item.computed)
                        } else if (item.dataIndex && typeof item.dataIndex === 'string') {
                            excelHeader.push(item.dataIndex)
                        } else {
                            excelHeader.push(null)
                        }
                    })
                    excelData += '</thead>'
                    excelData += '<tbody>'
                    dataSource.forEach(function (item) {
                        excelData += '<tr>'
                        excelHeader.forEach(function (key) {
                            excelData += '<td>'
                            if (typeof key === 'string') {
                                excelData += item[key]
                            } else if (typeof key === 'function') {
                                excelData += key(item) || ''
                            } else {
                                excelData += ''
                            }
                            excelData += '</td>'
                        })
                        excelData += '</tr>'
                    })
                    excelData += '</tbody>'
                    return xlsTemp.replace('${table}', excelData)
                }
            })()

            this.jsonToCSV = function (dataSource, columns) {
                var csvData = '',
                  cvsHeader = [],
                  fields = []
                columns.forEach(function (item) {
                    cvsHeader.push(item.title)
                    if (item.computed && typeof item.computed === 'function') {
                        fields.push(item.computed)
                    } else if (item.dataIndex && typeof item.dataIndex === 'string') {
                        fields.push(item.dataIndex)
                    } else {
                        fields.push(null)
                    }
                })

                dataSource.forEach(function (item) {
                    fields.forEach(function (key) {
                        if (typeof key === 'string') {
                            csvData += item[key]
                        } else if (typeof key === 'function') {
                            csvData += key(item) || ''
                        } else {
                            csvData += ''
                        }
                        csvData += ','
                    })
                    csvData = csvData.slice(0, csvData.length - 1)
                    csvData += '\r\n'
                })
                return cvsHeader.join(',') + '\r\n' + csvData
            }

            return this
        }).call({})

        var EXPORT_TYPE_HANDLE = {
            xls: EXPORT_TYPES_FN.jsonToExcel,
            xlsx: EXPORT_TYPES_FN.jsonToExcel,
            csv: EXPORT_TYPES_FN.jsonToCSV
        }

        function exportFile (dataSource, fileName, columns) {
            var files = getFileNameParts(fileName || 'test')
            var mineType = EXPORT_TYPES[files.suffix]
            if (!mineType) {
                console.log('Export of the current file type is not supported!')
                return
            }
            var fileData = 'data:' + mineType + ';base64,' + base64(EXPORT_TYPE_HANDLE[files.suffix](dataSource, generateColumns(dataSource, columns)))
            download(fileData, files.name + '.' + files.suffix)
        }

        function getFileNameParts (fileName) {
            var result = {
                name: fileName,
                suffix: defaultFileSuffix
            }
            var partArr = new RegExp('(.+)\\.(\\w+)$', 'i').exec(fileName)
            if (partArr && partArr) {
                result.name = partArr[1]
                result.suffix = partArr[2]
            }
            return result
        }

        function generateColumns (data, cols) {
            if (cols && cols.length > 0) {
                return cols
            }
            var columns = []
            if (data && data.length) {
                var firstItem = data[0]
                for (var key in firstItem) {
                    if (firstItem.hasOwnProperty(key)) {
                        columns.push({
                            title: key,
                            dataIndex: key
                        })
                    }
                }
            }
            return columns
        }

        function base64 (s) {
            return window.btoa(window.unescape(encodeURIComponent(s)))
        }

        function download (base64data, fileName) {
            if (window.navigator.msSaveBlob) {
                var blob = base64ToBlob(base64data)
                window.navigator.msSaveBlob(blob, fileName)
                return false
            }
            var alink = document.createElement('a')
            var blobUrl = base64data
            if (window.URL.createObjectURL) {
                var blob = base64ToBlob(base64data)
                blobUrl = window.URL.createObjectURL(blob)
            }
            alink.href = blobUrl
            alink.download = fileName
            document.body.appendChild(alink)
            alink.click()
            setTimeout(function () {
                document.body.removeChild(alink)
            }, 1)
        }

        function base64ToBlob (base64Data) {
            var arr = base64Data.split(','),
              mime = arr[0].match(/:(.*?);/)[1],
              bstr = atob(arr[1]),
              n = bstr.length,
              u8arr = new Uint8Array(n)
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
            }
            return new Blob([u8arr], {
                type: mime
            })
        }

        return {
            exportFile: exportFile
        }
    }())
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return JSONEXPORT
        })
    } else if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = JSONEXPORT
        }
        exports.JSONEXPORT = JSONEXPORT
    } else {
        global.JSONEXPORT = JSONEXPORT
    }
})(this)