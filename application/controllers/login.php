<?php 
class Login extends CI_Controller {

	function __construct() {
		parent::__construct();
		
		$this->load->model('Users_Model');
	}
	
	function index() {
		if (! $this->safety->allowByControllerName(__METHOD__) ) { return errorForbidden(); }
		
		$form = array(
			'frmId'				=> 'frmLogin',
			'messages' 			=> getRulesMessages(),
			'buttons'			=> array('<button type="submit" class="btn btn-primary"><i class="icon-signin"></i> Login </button>'),
			'fields'			=> array(
				'email' => array(
					'type'	=> 'text',
					'label'	=> 'Email', 
					'value'	=> set_value('email')
				),
				'password' => array(
					'type'	=> 'password',
					'label'	=> 'Contraseña', 
					'value'	=> set_value('password')
				),
				'link'	=> array(
					'type'	=> 'link',
					'label'	=> 'reset password', 
					'value'	=> 'users/forgotPassword'				
				)
			)
		);
		
		$form['rules'] = array( 
			array(
				'field' => 'email',
				'label' => $form['fields']['email']['label'],
				'rules' => 'required|valid_email|callback__login'
			),
			array(				 
				'field' => 'password',
				'label' => $form['fields']['password']['label'],
				'rules' => 'required'
			)
		);		
		
		$this->form_validation->set_rules($form['rules']);
		$this->form_validation->set_message($form['messages']);


		if ($this->input->is_ajax_request()) {
			$code = $this->form_validation->run(); 
			return $this->load->view('ajax', array(
				'code'		=> $code, 
				'result' 	=> ($code == false ? validation_errors() : array('goToUrl' => base_url('home'))) 
			));
		}			
					
		$aServerData = array('fbApi' => null);
		switch ($_SERVER['SERVER_NAME']) {
			case 'jcarle.redirectme.net':
				$aServerData['fbApi'] 		= '581547605212584';
				$aServerData['googleApi'] 	= '522657157003-rm53dmqk4hnjtrnphpara5odtet8qj0i.apps.googleusercontent.com';
				break;
			case 'www.jcarle.com.ar':
				$aServerData['fbApi'] 		= '470466523040981'; 
				$aServerData['googleApi'] 	= '522657157003.apps.googleusercontent.com';
				break;
			case 'www.clonereader.com.ar':
				$aServerData['fbApi'] 		= '605522602845255'; 
				$aServerData['googleApi'] 	= '';
				break;				
		}	
						
		if ($this->form_validation->run() == FALSE) {
			return $this->load->view('includes/template', array(
				'view'			=> 'login', 
				'title'			=> 'Ingresar',
				'form'			=> $form,
				'aServerData'	=> $aServerData
			));
		}
		
		redirect('home');
	}
	

	function _login() {
		return $this->safety->login($this->input->post('email'), $this->input->post('password'));
	}
	
	function loginRemote() {
		$user = $this->Users_Model->loginRemote($this->input->post('userEmail'), $this->input->post('userLastName'), $this->input->post('userFirstName'), $this->input->post('provider'), $this->input->post('remoteUserId') );

		if ($user == null) {
			return $this->load->view('ajax', array(
				'code'		=> false, 
				'result' 	=> 'error!' 
			));
		}

		$this->session->set_userdata(array(
			'userId'  		=> $user->userId,
		));		
		
		return $this->load->view('ajax', array(
			'code'		=> true, 
			'result' 	=> '' 
		));
	}
}
