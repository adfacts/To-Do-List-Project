$(document).ready(function () {
    const checkBox = $("#myCheckbox");
    const button = $("#myButton");

    button.click(function () {
        if (checkBox.checked) {
            const checkBoxValue = checkBox.val();
            const data = { checkBoxValue: checkBoxValue }
            $.ajax({
                url: "/delete",
                type: "POST",
                contentType: "application/json",
                data: data,
                success: function(response) {
                    console.log("post request successful: ", response);
                },
                error: function (error) {
                    console.log("Post request error: ", error);
                }
            });
        }
    });

});


$("button.grid-item").on("click", function () {
    $(this).toggleClass("cross-fade");
});
