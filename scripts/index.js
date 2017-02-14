let app = new Vue({
    el: '#yi',
    data: {
        name: 'guangyi',
        //上传的文件列表
        file_lists: null,
        //导入的数据
        xlxs_data: null,
        //标签数组(承保台账|到期保单台账|未续台账|当月起保台账|非当月起保台账)
        tabs: [],
        //激活的tab标签
        activeTab: 'tab_two',
        //当月时间
        now_time: '',
        //当月转保保费
        premium_off: null,
        //当月起保保费
        premium_on: null,
        //月保费目标 初始100万
        premium_target: 1000000,
        //月进度
        premium_progress: null,
        //存量保费
        premium_stock: null,
    },
    mounted: function() {
        //初始化时间
        let now = new Date();
        this.now_time = now;
    },
    watch: {
        /**
         * 监听 月目标值改变 重新渲染 汇总表
         */
        premium_target: function(val) {
            if (this.xlxs_data) {
                //清空['汇总表'] 重新渲染 数据汇总
                this.xlxs_data['汇总表'] = null;
                this.premiumSummary(this.xlxs_data);
            }
        }
    },
    methods: {
        handleSelect: function(key, keyPath) {
            switch (key) {
                case 'excel_in':
                    document.querySelector('#file_yi').click();
                    break;
                default:
                    console.log(key)
                    break;
            }
        },
        /**
         * 文件上传 解析 赋值
         */
        fileInput: function(e) {
            //存储文件列表
            this.file_lists = e.target.files;
            let file = this.file_lists[0];

            let that = this;
            let obj_data = {};

            let reader = new FileReader();
            reader.onload = function(e) {
                let data = e.target.result;
                let workbook = XLSX.read(data, { type: 'binary' });

                workbook.SheetNames.forEach(function(sheetName) {
                    // Here is your object
                    let XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                    let json_object = JSON.stringify(XL_row_object);
                    //解析到的数据以key，value存储
                    obj_data[sheetName] = XL_row_object;
                    //将excel的sheetName存储于tabs数组
                    that.tabs.push(sheetName);
                });
                //clearRows清理空row
                that.xlxs_data = that.clearRows(obj_data);
                // 运算 添加筛选后表单
                that.operate(that.xlxs_data);
                //数据汇总
                that.premiumSummary(that.xlxs_data);
            }
            reader.readAsBinaryString(file);
        },
        //导出xls
        excelOut: function() {
            if (this.xlxs_data == null) {
                this.$alert('请先导入Excel数据，可从Excel模板中获取模板文件', '警告', {
                    confirmButtonText: '确定'
                });
            } else {
                //1.承保台账表
                let _sh_1_headers = ['序号', '车牌号码', '被保险人', '签单日期', '起保日期', '经办人', '纯保费'];
                let _sh_1_data = this.xlxs_data['承保台账'];
                let sh_1 = this.shOutputRef(_sh_1_headers, _sh_1_data);

                //2.到期保单台账表
                let _sh_2_headers = ['序号', '车牌号码', '被保险人', '终保日期', '经办人', '保费'];
                let _sh_2_data = this.xlxs_data['到期保单台账'];
                let sh_2 = this.shOutputRef(_sh_2_headers, _sh_2_data);

                //3.未续台账表
                let _sh_3_headers = ['序号', '车牌号码', '被保险人', '终保日期', '经办人', '保费', '跟踪情况', '脱保流向'];
                let _sh_3_data = this.xlxs_data['未续台账'];
                let sh_3 = this.shOutputRef(_sh_3_headers, _sh_3_data);

                //4.当月起保台账表
                let _sh_4_headers = ['序号', '车牌号码', '被保险人', '签单日期', '起保日期', '经办人', '纯保费'];
                let _sh_4_data = this.xlxs_data['当月起保台账'];
                let sh_4 = this.shOutputRef(_sh_4_headers, _sh_4_data);

                //5.非当月起保台账表
                let _sh_5_headers = ['序号', '车牌号码', '被保险人', '签单日期', '起保日期', '经办人', '纯保费'];
                let _sh_5_data = this.xlxs_data['非当月起保台账'];
                let sh_5 = this.shOutputRef(_sh_5_headers, _sh_5_data);

                //6.汇总表
                let _sh_6_headers = ['当月转保单保费', '当月起保保费', '月保费目标', '月进度', '存量保费'];
                let _sh_6_data = this.xlxs_data['汇总表'];
                let sh_6 = this.shOutputRef(_sh_6_headers, _sh_6_data);

                // 构建 workbook 对象
                var wb = {
                    SheetNames: ['承保台账', '到期保单台账', '未续台账', '当月起保台账', '非当月起保台账', '汇总表'],
                    Sheets: {
                        '承保台账': Object.assign({}, sh_1.output, { '!ref': sh_1.ref }),
                        '到期保单台账': Object.assign({}, sh_2.output, { '!ref': sh_2.ref }),
                        '未续台账': Object.assign({}, sh_3.output, { '!ref': sh_3.ref }),
                        '当月起保台账': Object.assign({}, sh_4.output, { '!ref': sh_4.ref }),
                        '非当月起保台账': Object.assign({}, sh_5.output, { '!ref': sh_5.ref }),
                        '汇总表': Object.assign({}, sh_6.output, { '!ref': sh_6.ref })
                    }
                };
                var wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
                var wbout = XLSX.write(wb, wopts);

                const now = new Date();
                const outName = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}-${now.getHours()}${now.getMinutes()}.xlsx`;
                /* the saveAs call downloads a file on the local machine */
                saveAs(new Blob([this.s2ab(wbout)], { type: "" }), outName);
            }

        },
        shOutputRef: function(_headers, _data) {
            let headers = this.headerToWorksheet(_headers);
            let data = this.dataToWorksheet(_data, _headers);
            // 合并 headers 和 data
            let output = Object.assign({}, headers, data);
            // 获取所有单元格的位置
            let outputPos = Object.keys(output);
            // 计算出范围
            let ref = outputPos[0] + ':' + outputPos[outputPos.length - 1];
            return { 'output': output, 'ref': ref };
        },
        headerToWorksheet: function(arr) {
        	// 为 _headers 添加对应的单元格位置
        	// 转换成 worksheet 需要的结构
            return arr
                .map((v, i) => Object.assign({}, { v: v, position: String.fromCharCode(65 + i) + 1 }))
                .reduce((prev, next) => Object.assign({}, prev, {
                    [next.position]: { v: next.v }
                }), {});
        },
        dataToWorksheet: function(arr, _headers) {
        	// 匹配 headers 的位置，生成对应的单元格数据
        	// 对刚才的结果进行降维处理（二维数组变成一维数组）
        	// 转换成 worksheet 需要的结构
            return arr
                .map((v, i) => _headers.map((k, j) => Object.assign({}, { v: v[k], position: String.fromCharCode(65 + j) + (i + 2) })))
                .reduce((prev, next) => prev.concat(next))
                .reduce((prev, next) => Object.assign({}, prev, {
                    [next.position]: { v: next.v }
                }), {});
        },
        s2ab: function(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        },
        /**
         * 清理空数据
         */
        clearRows: function(obj) {
            //遍历key
            for (key in obj) {
                //遍历value内的数组，对象数组唯一标识'车牌号码'为空则清除该列数组元素
                for (let i = 0; i < obj[key].length; i++) {
                    if (obj[key][i] === "" || typeof obj[key][i]['车牌号码'] === 'undefined') {
                        //删除特定索引的值
                        obj[key].splice(i, 1);
                        i = i - 1;
                    }
                }
            }
            return obj;
        },
        /**
         * 运算流程
         */
        operate(obj) {
            this.notRenew(obj);
            this.theSameMonth(obj);
            this.notSameMonth(obj);
        },
        /**
         * 筛选 承保台账表0 和 到期保单台账表1 计算出 未续台账表2
         * obj 表数据 Object
         */
        notRenew(obj) {
            let sheet_arr = this.tabs;

            //筛选出 到期保单台账表1 中与 承保台账表0 不同的数据
            let not_renew_arr = obj[sheet_arr[1]].filter(function(ele) {
                for (val of obj[sheet_arr[0]]) {
                    if (ele['车牌号码'] == val['车牌号码']) return false;
                }
                return true;
            });
            //对 未续台账表 的序号重新排序
            let arr_len = not_renew_arr.length;
            for (let i = 0; i < arr_len; i++) {
                not_renew_arr[i]['跟踪情况'] = '';
                not_renew_arr[i]['脱保流向'] = '';

                //附加高亮状态
                not_renew_arr[i].heightLight = true;
            }
            //更新数据
            this.tabs.push('未续台账');
            this.xlxs_data['未续台账'] = not_renew_arr;
        },
        /**
         * 筛选 承保台账表0 中当月起保的数据 计算出 当月起保台账表3
         * obj 表数据 Object
         */
        theSameMonth(obj) {
            let sheet_arr = this.tabs;
            //当月时间now_year|now_month
            let now_year = this.now_time.getFullYear();
            let now_month = this.now_time.getMonth() + 1;
            //筛选当月起保数据
            let same_month_arr = obj[sheet_arr[0]].filter(function(ele) {
                let start_date = new Date(Date.parse(ele['起保日期']));
                let start_year = start_date.getFullYear();
                let start_month = start_date.getMonth() + 1;

                if (start_year === now_year && start_month === now_month) {
                    return true;
                }
            });

            //更新数据
            this.tabs.push('当月起保台账');
            this.xlxs_data['当月起保台账'] = same_month_arr;
        },
        /**
         * 筛选 承保台账表0 中非当月起保的数据 计算出 非当月起保台账表4
         * obj 表数据 Object
         */
        notSameMonth(obj) {
            let sheet_arr = this.tabs;
            //当月时间now_year|now_month
            let now_year = this.now_time.getFullYear();
            let now_month = this.now_time.getMonth() + 1;
            //筛选当月起保数据
            let not_same_month_arr = obj[sheet_arr[0]].filter(function(ele) {
                let start_date = new Date(Date.parse(ele['起保日期']));
                let start_year = start_date.getFullYear();
                let start_month = start_date.getMonth() + 1;
                if (start_year !== now_year || start_month !== now_month) {
                    return true;
                }
            });

            //更新数据
            // if(this.tabs.indexOf('非当月起保台账') == -1){}
            this.tabs.push('非当月起保台账');
            this.xlxs_data['非当月起保台账'] = not_same_month_arr;
        },
        premiumSummary(obj) {
            //当月转保单保费
            let arr_a = [];
            for (val of obj['非当月起保台账']) {
                arr_a.push(parseFloat(val['纯保费']));
            }
            this.premium_off = arr_a.reduce(function(x, y) {
                return x + y;
            });
            arr_a = [];

            //当月起保保费
            for (val of obj['当月起保台账']) {
                arr_a.push(parseFloat(val['纯保费']));
            }
            this.premium_on = arr_a.reduce(function(x, y) {
                return x + y;
            });
            arr_a = [];

            //月进度
            this.premium_progress = parseFloat(this.premium_on / this.premium_target).toFixed(4)

            //存量保费
            for (val of obj['未续台账']) {
                arr_a.push(parseFloat(val['保费']));
            }
            this.premium_stock = arr_a.reduce(function(x, y) {
                return x + y;
            });
            arr_a = [];

            //更新数据
            this.xlxs_data['汇总表'] = [{
                '当月转保单保费': this.premium_off,
                '当月起保保费': this.premium_on,
                '月保费目标': this.premium_target,
                '月进度': this.premium_progress,
                '存量保费': this.premium_stock
            }];
        },
        /**
         * 改变时间
         */
        timeChange() {
            // console.log(this.now_time);
            // let obj = this.xlxs_data;
            // this.theSameMonth(obj);
            // this.notSameMonth(obj);
        }
    }
});
