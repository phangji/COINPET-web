/**
 * Created by jeon on 2015. 5. 23..
 */

$(document).ready(function() {

    $.ajax({
        type: 'GET',
        url: './html component/dashboard/week.html',
        dataType: 'html',
        success: function (html) {

            for(var i=0 ; i<child.length ; i++)
            {
                calculateWeek(child[i].fk_kids, html);
            }
        },
        error: function (result, statu, err) {
            alert("dashboard_kids.html 불러오기 실패\n" + err);
        }
    });
});

function calculateWeek(fk_kids, html){

    $.ajax({
        type: 'GET',
        url: domain + '/api/saving/' + fk_kids,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", jwt);
        },
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        success: function (result) {
            var start = new Date();
            start.setDate(start.getDate() - 7);
            var i = result.length;
            var money = 0;
            var savingday = new Array(7);

            while (i) {
                i--;
                var date = new Date(result[i].date);
                if (date < start)
                    break;
                money += result[i].now_cost;
                savingday[date.getDay()] = true;
            }
            var savingCount = 0;

            for (var i = 0; i < 7; i++)
                if (savingday[i] === true) savingCount++;

            money = money / savingCount;
            $('#insertWeek').prepend(html
                .replace('_fk_kids', fk_kids)
                .replace('_money', money)
                .replace('_count', savingCount)
                .replace('_stateClass', 'success')
                .replace('_state', '아주 좋음'));
        },
        error: function () {
            alert('자녀의 저축 정보를 받아오는데 실패하였습니다.');
        }
    });
}
