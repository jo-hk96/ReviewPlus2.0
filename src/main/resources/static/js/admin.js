// tr 링크 클릭 이동 스크립트
function UserDetailLink(rowElement){
	const url = rowElement.getAttribute('data-url');
	if(url){
		window.location.href = url;
	}
}
		
// 사이드바 토글
const hamburger = document.querySelector(".toggle-btn");
const toggler = document.querySelector("#icon");
hamburger.addEventListener("click", function () {
		document.querySelector("#sidebar").classList.toggle("expand");
		toggler.classList.toggle("bx-chevrons-right");
		toggler.classList.toggle("bx-chevrons-left");
});

// 모달 열기
function openModal(modalId) {
  const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'block';
    }
}

// 모달 닫기
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
    if (modal) {
       modal.style.display = 'none';
    }
}

// 모달 바깥을 클릭해도 닫힘
window.onclick = function(event) {
   const modal = document.getElementById('editUserModal');
     if (event.target == modal) {
       modal.style.display = 'none';
     }
}

// -- 회원상태 수정창 스크립트 --
function toggleStatusButtons(containerId){
	const container = document.getElementById(containerId)
	  if (container) {
          //show 클래스가 있으면 제거하고, 없으면 추가함
          container.classList.toggle('show');
      }
}

// -- 회원 리뷰 행 선택 시 해당 URL로 이동 -->
function UserDetailLink(rowElement){
	const url = rowElement.getAttribute('data-url');
		if(url){
			window.location.href = url;
		}
}