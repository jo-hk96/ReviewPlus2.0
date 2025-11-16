document.addEventListener('DOMContentLoaded', function() {
	    const scrollBtn = document.getElementById("scrollToTopBtn");
	
	    window.onscroll = function() {
	        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
	            scrollBtn.style.display = "block";
	        } else {
	            scrollBtn.style.display = "none";
	        }
	    };
	
	    // 클릭 시 맨 위로 이동
	    scrollBtn.addEventListener('click', function() {
	        window.scrollTo({
	            top: 0,
	            behavior: 'smooth' 
	        });
	    });
	});
	
	
	
