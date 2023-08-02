jQuery(function ($) {

    // email resend
    $('.resend').on('click',function(e) { 						// Button which will activate our modal
        var the_id = $(this).attr('id');						//get the id
        // show the spinner
        $(this).html("<i class='fa fa-spinner fa-pulse'></i>");
        $.ajax({											//the main ajax request
            type: "POST",
            data: "action=email_verify&id="+$(this).attr("id"),
            url: ajaxurl,
            success: function(data)
            {
                $("span#resend_count"+the_id).html(data);
                //fadein the vote count
                $("span#resend_count"+the_id).fadeIn();
                //remove the spinner
                $("a.resend_buttons"+the_id).remove();

            }
        });
        return false;
    });

    // user login
    $("#login-form").on('submit',function (e) {
        e.preventDefault();
        $("#login-status").slideUp();
        $('#login-button').addClass('button-progress').prop('disabled', true);
        var form_data = {
            action: 'ajaxlogin',
            username: $("#username").val(),
            password: $("#password").val(),
            is_ajax: 1
        };
        $.ajax({
            type: "POST",
            url: ajaxurl,
            data: form_data,
            dataType: 'json',
            success: function (response) {
                $('#login-button').removeClass('button-progress').prop('disabled', false);
                if (response.success) {
                    $("#login-status").addClass('success').removeClass('error').html('<p>'+LANG_LOGGED_IN_SUCCESS+'</p>').slideDown();
                    window.location.href = response.message;
                }
                else {
                    $("#login-status").removeClass('success').addClass('error').html('<p>'+response.message+'</p>').slideDown();
                }
            }
        });
        return false;
    });

    // blog comment with ajax
    $('.blog-comment-form').on('submit', function (e) {
        e.preventDefault();
        var action = 'submitBlogComment';
        var data = $(this).serialize();
        var $parent_cmnt = $(this).find('#comment_parent').val();
        var $cmnt_field = $(this).find('#comment-field');
        var $btn = $(this).find('.button');
        $btn.addClass('button-progress').prop('disabled',true);
        $.ajax({
            type: "POST",
            url: ajaxurl+'?action='+action,
            data: data,
            dataType: 'json',
            success: function (response) {
                $btn.removeClass('button-progress').prop('disabled',false);
                if(response.success){
                    if($parent_cmnt == 0){
                        $('.latest-comments > ul').prepend(response.html);
                    }else{
                        $('#li-comment-'+$parent_cmnt).after(response.html);
                    }
                    $('html, body').animate({
                        scrollTop: $("#li-comment-"+response.id).offset().top
                    }, 2000);
                    $cmnt_field.val('');
                }else{
                    $('#respond > .widget-content').prepend('<div class="notification error"><p>'+response.error+'</p></div>');
                }
            }
        });
    });

    // get all the order notifications
    var audioogg = new Audio(siteurl+'includes/assets/audio/message.ogg');
    var audiomp3 = new Audio(siteurl+'includes/assets/audio/message.mp3');
    var callWaiterMp3 = new Audio(siteurl+'includes/assets/audio/call-waiter.mp3');

    /* Manage new orders */
    function manage_orders(response)
    {
        if(!jQuery.isEmptyObject( response )){
            if($('#qr-orders-table').length) {
                for (var i in response) {
                    if (response.hasOwnProperty(i)) {
                        var order = response[i];

                        let table_number = '';
                        if(order.type == 'on-table')
                            table_number = order.table_number;
                        else if (order.type == 'takeaway')
                            table_number = '<span class="small-label margin-left-0">'+ LANG_TAKEAWAY +'</span>';
                        else if(order.type == 'delivery')
                            table_number = '<span class="small-label margin-left-0">'+ LANG_DELIVERY +'</span>';

                        var $row = $('<tr class="row-highlight">' +
                            '<td data-label="' + LANG_TABLE_NO + '">' +
                            table_number +
                            '</td>' +
                            '<td data-label="' + LANG_MENU + '">' +
                            order.items_tpl +
                            '</td>' +
                            '<td data-label="' + LANG_CUSTOMER + '">' +
                            '<div class="d-flex align-items-center">' +
                            '<i class="icon-feather-user"></i>&nbsp;' + order.customer_name +
                            (order.message != '' && order.message != null
                                ? '<span class="button gray ico margin-left-5 order-row-message" data-tippy-placement="top" title="' + order.message + '"><i class="icon-feather-message-square"></i></span>'
                                : '') +
                            '</div>' +
                            (order.phone_number != '' && order.phone_number != null
                                ? '<div><i class="icon-feather-phone"></i> ' + order.phone_number + '</div>'
                                : '') +
                            (order.address != '' && order.address != null
                                ? '<span><i class="icon-feather-map-pin"></i> ' + order.address + '</span>'
                                : '') +
                            '</td>' +
                            '<td data-label="' + LANG_PRICE + '">' +
                            '<span class="small-label margin-left-0">' +
                            order.price +
                            '</span>' +
                            '</td>' +
                            '<td data-label="' + LANG_STATUS + '" class="order-row-status">' +
                            '<span class="button gray ico order-status" data-tippy-placement="top" title="' + LANG_PENDING + '"><i class="icon-feather-clock"></i></span>' +
                            '</td>' +
                            '<td data-label="' + LANG_TIME + '"><small>' + order.created_at + '</small></td>' +
                            '<td>' +
                            '<button class="button ico qr-complete-order" data-tippy-placement="top" title="' + LANG_COMPLETE + '" data-id="' + order.id + '"><i class="icon-feather-check"></i></button>' +
                            ' <button class="button red ico qr-delete-order" data-tippy-placement="top" title="' + LANG_DELETE + '" data-id="' + order.id + '"><i class="icon-feather-trash-2"></i></button>' +
                            ' <button class="button green ico qr-view-order" data-tippy-placement="top" title="' + LANG_VIEW_ORDER + '" data-id="' + order.id + '"><i class="icon-feather-eye"></i></button>' +
                            '<div class="order-print-tpl-' + order.id + ' d-none">' +
                            order.order_print_tpl +
                            '</div>' +
                            '</td>' +
                            '</tr>');
                    }

                    $('#qr-orders-table').find('#order-rows').prepend($row);
                }

                $('.no-order-found').remove();
            }

            if(localStorage.notification_sound == 1) {
                audiomp3.play();
                audioogg.play();
            }

            setTimeout(function() {
                $('.row-highlight').removeClass("row-highlight");
            }, 1000);

        }
    }
    alertify.closeLogOnClick(true);
    alertify.delay(2000000);

    /* Manage waiter calls */
    function manage_waiter_calls(response)
    {
        if(!jQuery.isEmptyObject( response )){
            callWaiterMp3.play();

            for (var i in response) {
                if (response.hasOwnProperty(i)) {
                    var message = response[i];
                    alertify.success(message);
                }
            }


        }
    }

    /* Hearbeat */
    function quick_heartbeat() {
        $.ajax({
            type: "POST",
            url: ajaxurl,
            data: {
                action: 'quickHeartBeat'
            },
            dataType: 'json',
            success: function (response) {
                manage_orders(response.orders);
                manage_waiter_calls(response.waiterCalls);
            }
        });
    }
    setInterval(quick_heartbeat, 10000);

});