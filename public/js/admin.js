/**
 * Created by jack on 17/2/21.
 */
$(window).ready(function () {
    currentPage = 0;
    findPostList();

    $('#review-submit').on('click', function () {
        submitClicked();
    });

    $('#reviewImg').on('click', function () {
        reviewImgClick();
    });

    $('.editIcon').on('click', function () {
        openImage();
    });

    $('#review-search').on('click', function () {
        postPerPage = 10;
        currentPage = 0;
        findPostList();
    });

    $('#newReview').on('click', function () {
        $('#reviewModal').modal('show');
        postId = '';
        productUrl = '';
        renderReviewModel('new', null);
    });

    $('.review-image-file').on('change', function () {
        changeImage();
    });

    $('#reviewModal').on('hidden.bs.modal', function () {
        resetReviewForm();
    });

});

var postPerPage = 10;
var currentPage = 0;
var isClientTempPhoto = false;
var tempImageUrl = '';
var type = '';
var postId = '';
var productUrl = '';
//new, edit, reply

function renderPostList(data) {

    $('#post-list').empty();

    $.each(data.postList, function (index, entry) {

        entry.text = entry.text || '';
        entry.text = entry.text.replace('\n', '<br>');

        var template = '';
        template += '<tr class="odd gradeX">';
        template += '<td>{postId}</td>';
        template += '<td>{userName}</td>';
        template += '<td>{text}</td>';
        template += '<td>{image}</td>';
        template += '<td>{createTime}</td>';
        template += '<td><i class="glyphicon glyphicon-edit" id="select_{postId}" style="cursor: pointer"></i> {reply}</td>';
        template += '</tr>';

        template = replaceAll('{userName}', entry.userName, template);
        template = replaceAll('{createTime}', timestampToDate(entry.createTime), template);
        template = replaceAll('{text}', entry.text, template);
        if (entry.imageUrl) {
            template = replaceAll('{image}', '<img style="max-width: 40px; max-height: 40px;" src=' + entry.imageUrl + '>', template);
        } else {
            template = replaceAll('{image}', '', template);
        }
        template = replaceAll('{postId}', entry.postId, template);
        var reply = '';
        if (entry.postDepth == '0') {
            reply = '<i class="glyphicon glyphicon-comment" id="reply_' + entry.postId + '" style="cursor: pointer; margin-left: 10px"></i>';
        }
        template = replaceAll('{reply}', reply, template);


        $('#post-list').append(template);

        $("#select_" + entry.postId).on('click', function () {
            $('#reviewModal').modal('show');
            postId = entry.postId;
            renderReviewModel('edit', entry);

        });

        $("#reply_" + entry.postId).on('click', function () {
            $('#reviewModal').modal('show');
            postId = entry.postId;
            productUrl = entry.productUrl;
            renderReviewModel('reply', null);

        });
    });

}

function renderReviewModel(mType, data) {
    type = mType;
    if (mType == 'new') {
        $('#reivewModalLabel').html('Add Review');
        $('#productPanel').show();
        $('.imageForm').show();
        $('#starForm').show();
    } else if (mType == 'reply') {
        $('#reivewModalLabel').html('Reply Review');
        $('#product-url').val(productUrl);
        $('#productPanel').hide();
    } else if (mType == 'edit') {
        $('#reivewModalLabel').html('Edit Review');
        $('#productPanel').show();
    }
    if (!!data) {
        $('#product-url').attr('disabled', true);
        $('#product-url').val(data.productUrl);
        $('#username').val(data.userName);
        $('#reviewtxt').val(data.text);
        if (data.postDepth == '0') {
            $('.imageForm').show();
            console.log('show image');
            if (data.imageUrl) {
                $('#reviewImg').attr('src', data.imageUrl);
            } else {
                $('.editIcon').hide();
            }

            $('#starForm').show();
        }

        if (data.score) {
            $('#star').attr('data-score', data.score);
        }

        if (data.status) {
            $("#review-status").val(data.status);
        }
    }

    $('#star').raty({
        path: '/images',
        score: function () {
            return $(this).attr('data-score');
        }

    });
}

function renderPagination(data) {
    $('.M-box').pagination({

        current: (data.page + 1),
        pageCount: data.totalPages,

        callback: function (api) {
            currentPage = api.getCurrent() - 1;
            findPostList(currentPage);
        }
    });
}

function findPostList(page) {
    var page = page || currentPage;
    var keyword = $('#keyword').val();
    var sort = $('#review-sort').val();
    var status = $('#review-search-status').val();

    var params = {
        page: page,
        pageSize: postPerPage,
        sort: sort,
        status: status
    };

    if ($.trim(keyword).length > 0) {
        params.keyword = keyword;
    }

    $.ajax(URI.Post.List(params))
        .done(function (res) {
            renderPostList(res);
            renderPagination(res);
        })
        .fail(function (jqXHR) {
            checkToken(jqXHR);
        });
}

function submitClicked() {
    if (type) {
        if (type == 'edit') {
            updatePost();
        } else {
            addPost();
        }
    }
}

function updatePost() {
    var username = $('#username').val();
    var text = $('#reviewtxt').val();
    var status = $("#review-status").val();
    var star = $('#star').raty('score');

    var params = {
        postId: postId,
        userName: username,
        text: text,
        status: status,
        score: star
    };
    if (tempImageUrl) {
        params.isClientTempPhoto = isClientTempPhoto;
        params.tempImageUrl = tempImageUrl;
    }

    $.ajax(URI.Post.Update(params))
        .done(function (res) {
            showMessage(true, "Review modified successfully.");
            $('#reviewModal').modal('hide');
            resetReviewForm();
            findPostList();
        })
        .fail(function (jqXHR) {
            checkToken(jqXHR);
            showMessage(false, "Review modified failure.");
            // resetReviewForm();
            // findPostList();
        });
}

function addPost() {
    var username = $('#username').val();
    var text = $('#reviewtxt').val();
    var status = $("#review-status").val();
    var productUrl = $("#product-url").val();
    var star = $('#star').raty('score');

    if ($.trim(username).length == 0) {
        alert('User nicknames should not be empty.');
        return;
    }

    if ($.trim(text).length == 0) {
        alert('Comment should not be empty.');
        return;
    }

    if ($.trim(productUrl).length == 0) {
        alert('Product link should not be empty.');
        return;
    }
    var params = {
        userName: username,
        text: text,
        status: status,
        score: star,
        isClientTempPhoto: false,
        productUrl: productUrl,
        postDepth: 0
    };
    if (postId) {
        params.parentPostId = postId;
        params.postDepth = '1'
    }
    if (tempImageUrl) {
        params.isClientTempPhoto = isClientTempPhoto;
        params.tempImageUrl = tempImageUrl;
    }

    $.ajax(URI.Post.Add(params))
        .done(function (res) {
            showMessage(true, "Add review successfully.");
            $('#reviewModal').modal('hide');
            resetReviewForm();
            findPostList();
        })
        .fail(function (jqXHR) {
            // checkToken(jqXHR);
            showMessage(false, "Add review failure.");
            // resetReviewForm();
            // findPostList();
        });
}

function resetReviewForm() {
    type = '';
    postId = '';
    productUrl = '';
    $('#product-url').removeAttr('disabled');
    $('#product-url').val('');
    $('#username').val('');
    $('#reviewtxt').val('');
    $('#reviewImg').removeAttr('src');
    $('#star').attr('data-score', 0);
    $("#review-status").val('ACTV');
}

function openImage() {
    $('input.review-image-file').trigger('click');
}

function reviewImgClick() {
    var code = $('#reviewImg').attr('src');
    if (!code) {
        openImage();
    } else {
        //review img
    }
}

function changeImage(event) {
    var reader = new FileReader();
    reader.onload = function () {
        var file = document.getElementById('review-file').files[0];
        $('#reviewImg').attr('src', reader.result);
        $('.editIcon').show();
        isClientTempPhoto = true;
        tempImageUrl = reader.result;
    };
    reader.readAsDataURL(document.getElementById('review-file').files[0]);
}


