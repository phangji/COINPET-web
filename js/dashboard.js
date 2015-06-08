/**
 * Created by jeon on 2015. 5. 23..
 */

var quest_selected = {};
var quest_rec;
var state = ['', 'doing', 'waiting', 'retry', 'finish'];

function submitQuest() {

    var type = $('#type').val();
    var content = $('#content').val();
    var startTime = $('#startTime').val();
    var point = 100;

    if( !type )
    {
        alert('퀘스트 유형을 선택해 주세요.');
        return false;
    }

    if(quest_selected) {
        $.ajax({
            type: 'POST',
            url: domain + '/api/quest/parents/' + quest_selected,
            headers : {"Authorization": jwt},
            data: {
                type: type,
                content: content,
                startTime: startTime,
                point: point,
                state: 'doing'
            },
            success: function (result) {
                alert('퀘스트가 만들어졌습니다.');
                $(location).attr('href','./quest.html');

            },
            error: function (result, status, err) {
                alert('퀘스트를 만드는데 실패하였습니다.\n' + err);
            }
        });
    }
}

$(document).ready(function() {

    "use strict";

    if(!jwt || !child)
    {
        alert('로그인 정보가 없습니다. 다시 로그인해 주세요.');
        $(location).attr('href','./login.html');
    }

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
        error: function (result, status, err) {
            alert("dashboard_kids.html 불러오기 실패\n" + err);
        }
    });

    $.ajax({
        type: 'GET',
        url: './html component/dashboard/quest.html',
        dataType: 'html',
        success: function (html) {

            $.ajax({
                type: 'GET',
                url: domain+'/api/getQuestInfo/0',
                headers: {"Authorization": jwt},
                success: function (result) {

                    quest_rec = {};
                    $.each(child, function(index, value)
                    {
                        calculateQuest(value.fk_kids, result[value.fk_kids], html);

                        $('.panel_close').click(function() {
                            $('body').click();
                        });

                    });
                },
                error: function (result, status, err) {
                    alert("자녀의 퀘스트 정보를 받아오는데 실패하였습니다.\n" + err);
                }
            });
        },
        error: function (result, status, err) {
            alert("dashboard_quest.html 불러오기 실패\n" + err);
        }
    });

    $.ajax({
        type: 'GET',
        url: './html component/quest/add.html',
        dataType: 'html',
        success: function (html){
            $('body').append(html
                .replace('_min', (new Date().yyyymmdd())));
            $('body').click(function() {

                quest_selected = 0;
                $('.quest_rec_dis').show();
                $('.quest_rec_en').hide ();
                $('.popup').hide();
            });
            $('.panel_add').click(function (e){
                e.stopPropagation();
            });
            $(window).resize(function() {
                $('.popup').css("height", $(window).height());
                $('.panel_add').css("margin-top", ( $(window).height() - $('.panel_add').height() ) / 2);
            });

            var temp = '<div class="col-xs-6 col-sm-6"><div class="kidsimg"><img class="kidsimg kidsimgo" src="./image/kids/_fk_kids.png">_name</div></div>';

            for(var i in child)
                $('#quest_kidsSelect').append(temp
                    .replace('_name', child[i].name)
                    .replace('_fk_kids', child[i].fk_kids));

        },
        error: function (result, status, err) {
            alert("quest_add.html 불러오기 실패");
        }
    });
});

function calculateQuest(fk_kids, quest_data, html)
{
    if( quest_data == null) {
        alert(fk_kids + '의 진행중인 퀘스트가 없습니다.');
        return;
    }

    var quest_finish = 0;
    var quest_type_json = {};
    var quest_type_array = [];
    quest_type_json.study = {};
    quest_type_json.exercise = {};
    quest_type_json.etc = {};

    quest_type_json.study.count = 0;
    quest_type_json.exercise.count = 0;
    quest_type_json.etc.count = 0;

    quest_type_json.study.finish = 0;
    quest_type_json.exercise.finish = 0;
    quest_type_json.etc.finish = 0;

    for(var index_data in quest_data)
    {
        var quest_type = quest_data[index_data].type;

        if( !quest_type)
            quest_type = "etc";

        quest_finish += (state[quest_data[index_data].state] == "finish");
        quest_type_json[quest_type].finish += (state[quest_data[index_data].state] == "finish");
        quest_type_json[quest_type].count++;
    }

    $.each(quest_type_json ,function(key, value)
    {
        var quest_type_finish_percent = value.finish / value.count * 100;

        if(!quest_type_finish_percent) quest_type_finish_percent = 0;

        quest_type_array.push([key, key, quest_type_finish_percent, value.count]);
    });

    quest_type_array.sort(function(a,b){return b[2]-a[2]});
    quest_type_array.forEach(function(value, index, arr)
    {
        if(value[1] == "etc") {
            arr.push(["기타", "etc", value[2]]);
            arr.splice(index, 1);
            value = arr[index];
        }

        if (value[1] == "study") value[0] = "공부";
        else if (value[1] == "exercise") value[0] = "운동";
    });

    var quest_finish_percent = quest_finish / (index_data*1+1) * 100;
    $('#insertQuest').prepend(html
        .replace(/_percent/g, Math.round(quest_finish_percent*100)/100)
        .replace(/_fk_kids/g, fk_kids)
        .replace(/_name/g, findChild(fk_kids)));

    var type_bar = '<li><span>_type _percent%</span><div class="skill-bar-holder"><div class="skill-capacity" style="width:_percent%"></div></div></li>';
    $.each(quest_type_array, function(index, value) {
        $('#insert_quest_type'+fk_kids).append(type_bar
            .replace('_type', value[0])
            .replace(/_percent/g, Math.round(value[2]*100)/100));
    });

    if(quest_finish_percent > 90)
    {
        var text = '아주 좋습니다! _name 아이의 퀘스트 성공률은 아주 높은 편입니다.<br>'
            +'우리 _name에게는 새로운 유형의 퀘스트를 주는건 어떨까요?<br>'
            +'상대적으로 수행 횟수가 낮은 퀘스트를 추천드립니다.';

        quest_type_array.splice(-1, 1);
        quest_type_array.sort(function(a,b){return a[3]-b[3]});
        quest_rec[fk_kids] = quest_type_array[0][1];

    }
    else if(quest_finish_percent > 70) {
        var text = '좋습니다! _name 아이의 퀘스트 성공률은 다소 높은 편입니다.<br>'
            + '우리 _name에게는 다소 성공률이 낮았던 퀘스트를 다시 도전해 보도록 하면 어떨까요?<br>'
            + '어떤 임무든 척척 해낼 수 있는 아이가 되도록 도와주세요.';

        quest_type_array.splice(-1, 1);
        quest_type_array.sort(function(a,b){return a[2]-b[2]});
        quest_rec[fk_kids] = quest_type_array[0][1];
    }
    else if(quest_finish_percent > 50) {
        var text = '무난하군요. _name 아이의 퀘스트 성공률은 평균적입니다.<br>'
            + '우리 _name 아이가 잘 할 수 있는 퀘스트는 어떤 퀘스트일까요?<br>'
            + '성공률이 높었던 유형의 퀘스트를 추천드립니다.';
        quest_rec[fk_kids] = quest_type_array[0][1];
    }
    else {
        var text = '_name 아이의 퀘스트 성공률이 다소 낮은 편입니다.<br>'
            + '우리 _name 아이가 잘 할 수 있는 퀘스트는 어떤 퀘스트일까요?<br>'
            + '성공률이 높었던 유형의 퀘스트를 추천드립니다.';
        quest_rec[fk_kids] = quest_type_array[0][1];
    }

    $('#insert_quest_command'+fk_kids).html(text.replace(/_name/g, findChild(fk_kids)));

    $('#addQuest'+fk_kids).click(function(e) {
        e.stopPropagation();
        quest_selected = fk_kids;

        for(var i in quest_data)
        {
            if(quest_data[i].type == quest_rec[fk_kids])
            {
                $('#type').val(quest_rec[fk_kids]);
                $('#content').val(quest_data[i].content);
                $('#startTime').val((new Date()).yyyymmdd());
                break;
            }
        }

        $('.quest_rec_dis').hide();
        $('.quest_rec_en').show();
        $('.addQuest').show();
        $('.popup').css("height", $(window).height());
        $('.panel_add').css("margin-top", ( $(window).height() - $('.panel_add').height() ) / 2);
    });

}

function calculateWeek(fk_kids, html){

    $.ajax({
        type: 'GET',
        url: domain + '/api/saving/' + fk_kids,
        headers : {"Authorization": jwt},
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

            if(savingCount)
                money = parseInt(money / savingCount);
            $('#insertWeek').prepend(html
                .replace('_name', findChild(fk_kids))
                .replace('_fk_kids', fk_kids)
                .replace('_money', money.toUnit())
                .replace('_count', savingCount)
                .replace('_stateClass', 'success')
                .replace('_state', '아주 좋음'));
        },
        error: function () {
            alert('자녀의 저축 정보를 받아오는데 실패하였습니다.');
        }
    });
}
