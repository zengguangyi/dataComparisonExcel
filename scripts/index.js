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
    el: '#app',
    data: {
        name: 'guangyi',
        file_lists: null,
        xlxs_data: {}
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
            console.log(e.target.files[0]);
            console.log(this.file_lists);
            let that = this;
            let obj = {};

            let file = e.target.files[0];

            let reader = new FileReader();
            reader.onload = function(e) {
                let data = e.target.result;
                let workbook = XLSX.read(data, { type: 'binary' });

                workbook.SheetNames.forEach(function(sheetName) {
                    // Here is your object
                    let XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                    let json_object = JSON.stringify(XL_row_object);
                    obj[sheetName] = XL_row_object;
                });
                    console.log(obj);
                    that.xlxs_data = obj;
                
            }
            reader.readAsBinaryString(file);
        }
    }
});
