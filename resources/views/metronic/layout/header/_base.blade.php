<div id="kt_header" style="" class="header  align-items-stretch" >
	<div class="container-fluid  d-flex align-items-stretch justify-content-between">
		<div class="d-flex align-items-center d-lg-none ms-n1 me-2" title="Show aside menu">
			<div class="btn btn-icon btn-active-color-primary w-30px h-30px w-md-40px h-md-40px" id="kt_aside_mobile_toggle">
				<i class="ki-outline ki-abstract-14 fs-1"></i>
            </div>
		</div>
		<div class="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
			<a href="?page=index" class="d-lg-none">
				<img alt="Logo" src="{{asset("img/logo.png")}}" class="h-25px"/>
			</a>
		</div>
		<div class="d-flex align-items-stretch justify-content-between flex-lg-grow-1">
			<div class="d-flex align-items-stretch" id="kt_header_nav">
                @include("metronic/layout/header/__menu")
			</div>
            @include("metronic/layout/header/__topbar")
		</div>
	</div>
</div>
