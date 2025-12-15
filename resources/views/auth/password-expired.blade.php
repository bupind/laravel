<!DOCTYPE html>
<html lang="es">
	<head>
		<title>Grusefi | Nueva Contraseña</title>
		<link rel="shortcut icon" href="{{asset('favicon.ico')}}" />
		<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700" />
		<link href="{{asset('assets/css/plugins.bundle.css')}}" rel="stylesheet" type="text/css" />
		<link href="{{asset('assets/css/style.bundle.css')}}" rel="stylesheet" type="text/css" />
	</head>
	<body id="kt_body" class="bg-body">
		<div class="d-flex flex-column flex-root">
			<div class="d-flex flex-column flex-column-fluid bgi-position-y-bottom position-x-center bgi-no-repeat bgi-size-contain bgi-attachment-fixed">
				<div class="d-flex flex-center flex-column flex-column-fluid p-10 pb-lg-20">
					<a href="#" class="mb-12">
						<img alt="Logo" src="{{asset('img/Logo.png')}}" class="h-80px" />
					</a>
                    <x-errors-login class="mb-4" :errors="$errors" />
					<div class="w-lg-550px bg-body rounded shadow-sm p-10 p-lg-15 mx-auto">
						<form class="form w-100" novalidate="novalidate" id="kt_new_password_form" method="post" action="{{ route('password.update') }}">
                            @csrf
							<div class="text-center mb-10">
								<h1 class="text-dark mb-3">Contraseña expirada</h1>
								<div class="text-gray-400 fw-bold fs-4">Ingresa una nueva contraseña por favor</div>
							</div>
							<div class="mb-10 fv-row">
								<div class="mb-1">

									<label class="form-label fw-bolder text-dark fs-6">Email</label>
									<div class="position-relative mb-3">
										<input class="form-control form-control-lg form-control-solid" readonly type="text" placeholder="" name="email" autocomplete="off" value="{{ session('status') }}" />
									</div>
								</div>
							</div>
							<div class="mb-10 fv-row">
								<div class="mb-1">
									<label class="form-label fw-bolder text-dark fs-6">Contraseña</label>
									<div class="position-relative mb-3">
										<input class="form-control form-control-lg form-control-solid" type="password" placeholder="" name="password" autocomplete="off" />
										<span class="btn btn-sm btn-icon position-absolute translate-middle top-50 end-0 me-n2" data-kt-password-meter-control="visibility">
											<i class="bi bi-eye-slash fs-2"></i>
											<i class="bi bi-eye fs-2 d-none"></i>
										</span>
									</div>
								</div>
							</div>
							<div class="fv-row mb-10">
								<label class="form-label fw-bolder text-dark fs-6">Confirmar contraseña</label>
								<input class="form-control form-control-lg form-control-solid" type="password" placeholder="" name="confirm-password" autocomplete="off" />
							</div>
							<div class="text-center">
								<button type="submit" id="kt_new_password_submit" class="btn btn-lg btn-primary fw-bolder">
									<span class="indicator-label">Guardar</span>
									<span class="indicator-progress">Espera un momento...
									<span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
		<script src="{{asset('assets/js/plugins.bundle.js')}}"></script>
		<script src="{{asset('assets/js/scripts.bundle.js')}}"></script>
		<script src="{{asset('assets/js/new-password.js')}}"></script>
	</body>

</html>
