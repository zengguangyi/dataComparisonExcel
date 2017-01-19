// ;
// (function() {

//     function fileInput() {
//         let file_input = document.getElementById('file_input');

//         file_input.addEventListener('change', function() {
//             let file = file_input.files[0];

//             let reader = new FileReader();
//             reader.onload = function(e) {
//                 let data = e.target.result;
//                 let workbook = XLSX.read(data, { type: 'binary' });

//                 workbook.SheetNames.forEach(function(sheetName) {
//                     // Here is your object
//                     let XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
//                     let json_object = JSON.stringify(XL_row_object);
//                     console.log(XL_row_object);

//                 })
//             }
//             reader.readAsBinaryString(file);
//         });
//     }

//     fileInput();
// })()

let app = new Vue({
    el: '#yi',
    data: {
        name: 'guangyi',
        //上传的文件列表
        file_lists: null,
        //导入的数据
        xlxs_data: {},
        //标签数组
        tabs: [],
        //激活的tab标签
        activeTab: 'tab_two'
    },
    methods: {
        handleSelect: function(key, keyPath) {
            switch (key) {
                case 'excel_in':
                    console.log(key);
                    break;
                case 'excel_out':
                    console.log(key);
                    break;
                default:
                    console.log(key);
                    break;
            }
        },
        /**
         * 文件上传 解析 赋值
         */
        fileInput: function(e) {
            
            //存储文件列表
            this.file_lists = e.target.files;
            console.log(this.file_lists[0]);
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
                console.log(obj_data);
                //clearRows清理空row
                that.xlxs_data = that.clearRows(obj_data);

                // console.log(that.tabs);
                // console.log(that.xlxs_data[that.tabs[0]]);

            }
            reader.readAsBinaryString(file);
        },
        /**
        * tab标签点击事件
        */
        tabsClick: function(tab, event) {
            console.log(tab.index, event);
        },
        /**
        * 清理空数据
        */
        clearRows: function(obj){
        	//遍历key
        	for(key in obj){
        		//遍历value内的数组，对象数组唯一标识'车牌号码'为空则清除该列数组元素
        		for(let i=0;i<obj[key].length;i++){
        			if(obj[key][i] === "" || typeof obj[key][i]['车牌号码'] === 'undefined'){
        				//删除特定索引的值
        				obj[key].splice(i,1);
        				i = i - 1;
        			}
        		}
        	}
        	return obj;
        }
    }
});
