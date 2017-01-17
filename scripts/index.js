;
(function() {
    var file_input = document.getElementById('file_input');

    file_input.addEventListener('change', function() {
        var file = file_input.files[0];

        var reader = new FileReader();
        reader.onload = function(e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, { type: 'binary' });

            workbook.SheetNames.forEach(function(sheetName) {
                // Here is your object
                var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                var json_object = JSON.stringify(XL_row_object);
                console.log(XL_row_object);

            })
        }
        reader.readAsBinaryString(file);
    });

})() 
