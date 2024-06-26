(() => {
	let streaming = false;
	let video = null;
	let canvas = null;
	let startbutton = null;
  
	function showViewLiveResultButton() {
	  if (window.self !== window.top) {
		document.querySelector(".contentarea").remove();
		const button = document.createElement("button");
		document.body.append(button);
		button.addEventListener("click", () => window.open(location.href));
		return true;
	  }
	  return false;
	}
	
	function startup() {
	  if (showViewLiveResultButton()) {
		return;
	  }

	video = document.getElementById("video");
	canvas = document.getElementById("canvas");
    photo = document.getElementById('photo');
	startbutton = document.getElementById("startbutton");

	// 와이드 렌즈 사용을 막는 코드
	var cid = 0;
	navigator.mediaDevices.enumerateDevices()
	.then(devices=> {
		var videoDevices = [0, 0];
		var videoDeviceIndex = 0;
		devices.forEach(function (device) {
			if (device.kind == "videoinput") {
				videoDevices[videoDeviceIndex++] = device.deviceId;
				console.log("setupVideo  device.deviceId: " + device.deviceId);
			}
		});
		if (videoDeviceIndex === 1) {
			cid = 0;
		}
		else if (videoDeviceIndex === 2) {
			cid = 1;
		}
		else if (videoDeviceIndex === 3) {
			cid = 2;
		}
		else if (videoDeviceIndex === 4) {
			cid = 3;
		}
		else if (videoDeviceIndex === 5) {
			cid = 4;
		}
		else if (videoDeviceIndex === 6) {
			cid = 5;
		}
		else {
			cid = 0;
		}

	//디바이스 권한
	var constraints = { 
		video:true,
		video: { 
			width:1920 , 
			height:1080 ,
			focusMode: "continuous",
			facingMode: { ideal: 'environment' } ,
			deviceId: videoDevices[cid]
		},audio: false
	}

	navigator.mediaDevices.getUserMedia(constraints)
		.then((stream) => {    
			video.srcObject = stream;
            video.muted = true; // 비디오를 음소거합니다.
            video.setAttribute("playsinline", ""); // iOS에서 자동 재생이 가능하게 설정
			const track=stream.getVideoTracks()[0];
			const capabilities=stream;
			if(!capabilities.focusDistance){
				return;
			}
  			// Map focus distance to a slider element.
  			const input = document.querySelector('input[type="range"]');
  			input.min = capabilities.focusDistance.min;
  			input.max = capabilities.focusDistance.max;
  			input.step = capabilities.focusDistance.step;
  			input.value = track.getSettings().focusDistance;

 		 	input.oninput = function(event) {
    			track.applyConstraints({
     				advanced: [{
        			focusDistance: event.target.value
     	 			}]
    			});
  			};
  			input.hidden = false;
			video.play();
			})
		.catch((err) => {
			  console.error(`An error occurred: ${err}`);
		});
	})

	video.addEventListener(
		"canplay",
		(ev) => {
		  if (!streaming) {
			streaming = true;
		  }
		},
		false
	  );

	startbutton.addEventListener(
		"click",
		(ev) => {
			if ((video.videoWidth == 1920 && video.videoHeight == 1080) || (video.videoWidth == 1080 && video.videoHeight == 1920)){
				takepicture();
		  		ev.preventDefault();
			}
			else{
				alert("카메라의 설정 해상도가 지원 해상도 1920 x 1080, 1080 x 1920 를 지원 할 수 없습니다.");
			}
		},
		false
	  );
	}

	// 캔버스 이미지로 변경
	function takepicture() {
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		var context=canvas.getContext("2d")
        context.drawImage(video, 0, 0);

		const data = canvas.toDataURL("image/png",1);
		downloadImage(data,"png",0);
	}

  	//이미지 다운
  	function downloadImage(data,format,delay=0) {
    setTimeout(function(){
        var a = document.createElement('a');
        let today = new Date()
        
        let filename=today.getFullYear().toString()+
        (today.getMonth()+1).toString()
        +today.getDate().toString()
        +'_'
        +today.getHours().toString()
        +today.getMinutes().toString()
        +today.getSeconds().toString()
        +today.getMilliseconds().toString()
        if(format!="png"){
          filename+=".jpg"
        }
        else{
          filename+=".png"
        }
        a.href = data;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
    },delay)
  }
	window.addEventListener("load", startup, false);
  })();