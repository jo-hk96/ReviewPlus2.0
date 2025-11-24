	//회원 목록
	$(document).ready(function() {
    var $dataTable = $('#UserDataTable');
    var dataRows = $dataTable.find('tbody tr');
    if (dataRows.length === 1 && dataRows.find('td[colspan]').length === 1) {
        $dataTable.find('tbody').empty();
    }
    $('#UserDataTable').DataTable({
		"info":false,
		"paging": true,
        "ordering": true,
        "searching": false,
        "lengthChange": false,
        
        "columnDefs": [
            { 
                "targets": '_all', // 모든 컬럼에 적용
                "className": "dt-center" // DataTables 내장 중앙 정렬 클래스
            }
        ],
    	"language": {
            "search": "",
            "searchPlaceholder": "회원 정보를 입력하세요.",
           	"emptyTable": "회원목록이 없습니다."
        }
    });
});


	//리뷰 목록
	$(document).ready(function() {
    var $dataTable = $('#UserReviewDataTable');
    var dataRows = $dataTable.find('tbody tr');
    if (dataRows.length === 1 && dataRows.find('td[colspan]').length === 1) {
        $dataTable.find('tbody').empty();
    }
    $('#UserReviewDataTable').DataTable({
		"info":false,
		"paging": true,
        "ordering": true,
        "searching": false,
        "lengthChange": false,
        
        "columnDefs": [
            { 
                "targets": '_all', // ⭐️ 모든 컬럼에 적용 ⭐️
                "className": "dt-center" // DataTables 내장 중앙 정렬 클래스
            }
        ],
    	"language": {
            "searchPlaceholder": "정보를 입력하세요.",
           	"emptyTable": "리뷰목록이 없습니다."
        }
    });
});



	//영화 좋아요 목록
	$(document).ready(function() {
    var $dataTable = $('#UserMovieLikeDataTable');
    var dataRows = $dataTable.find('tbody tr');
    if (dataRows.length === 1 && dataRows.find('td[colspan]').length === 1) {
        $dataTable.find('tbody').empty();
    }
    $('#UserMovieLikeDataTable').DataTable({
		"info":false,
		"paging": true,
        "ordering": true,
        "searching": false,
        "lengthChange": false,
        
        "columnDefs": [
            { 
                "targets": '_all', // ⭐️ 모든 컬럼에 적용 ⭐️
                "className": "dt-center" // DataTables 내장 중앙 정렬 클래스
            }
        ],
    	"language": {
            "searchPlaceholder": "정보를 입력하세요.",
           	"emptyTable": "영화 좋아요 목록이 없습니다."
        }
    });
});
	
	
	
	//유저상세 회원 리뷰 목록
	$(document).ready(function() {
    var $dataTable = $('#UserDetailDataTable');
    var dataRows = $dataTable.find('tbody tr');
    if (dataRows.length === 1 && dataRows.find('td[colspan]').length === 1) {
        $dataTable.find('tbody').empty();
    }
    $('#UserDetailDataTable').DataTable({
		"info":false,
		"lengthChange": false,
		"columnDefs": [
            { 
                "targets": '_all', // ⭐️ 모든 컬럼에 적용 ⭐️
                "className": "dt-center" // DataTables 내장 중앙 정렬 클래스
            }
        ],
    	"language": {
            "search": "",
            "searchPlaceholder": "회원 정보를 입력하세요.",
           	"emptyTable": "사용자의 리뷰가 없습니다."
        }
    });
});
	
	
