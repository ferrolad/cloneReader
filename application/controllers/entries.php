<?php 
class Entries extends CI_Controller {
	// TODO: implementar la seguridad!
	function __construct() {
		parent::__construct();	
		
		$this->load->model('Entries_Model');
	}  
	
	/*
	function __destruct() {
		// TODO: cerrar las conecciones
		$this->Commond_Model->closeDB();
		//$this->db->close();
	}*/
	
	function index() {
		$this->listing();
	}
	
	function listing() {
		if (! $this->safety->allowByControllerName(__METHOD__) ) { return errorForbidden(); }
		
		$page = (int)$this->input->get('page');
		if ($page == 0) { $page = 1; }
		
		$query = $this->Entries_Model->selectToList(PAGE_SIZE, ($page * PAGE_SIZE) - PAGE_SIZE, $this->input->get('filter'));
		
		$this->load->view('includes/template', array(
			'controller'	=> strtolower(__CLASS__),
			'view'			=> 'includes/paginatedList', 
			'title'			=> 'Editar Entries',
			'columns'		=> array('entryId' => '#', 'entryTitle' => 'Titulo', 'entryUrl' => 'Url'),
			'data'			=> $query->result_array(),
			'foundRows'		=> $query->foundRows,
			'pagination'	=> $this->pagination
		));
	}
	
	function select($page = 1) { // busco nuevas entries
//sleep(5);	
		$userId = (int)$this->session->userdata('userId');
	
		if ($this->input->post('pushTmpUserEntries') == true) {
			$this->Entries_Model->pushTmpUserEntries($userId);
		}
	
		return $this->load->view('ajax', array(
			'code'		=> true,
			'result' 	=> $this->Entries_Model->select($userId, (array)json_decode($this->input->post('post'))),
		));
	}

	function selectFilters() {
		return $this->load->view('ajax', array(
			'code'		=> true,
			'result' 	=> $this->Entries_Model->selectFilters($this->session->userdata('userId')),
		));
	}
	
	function edit($entryId) {
		if (! $this->safety->allowByControllerName(__METHOD__) ) { return errorForbidden(); }
		
		$form = $this->_getFormProperties($entryId);

		$this->form_validation->set_rules($form['rules']);
		$this->form_validation->set_message($form['messages']);
		
		$code = $this->form_validation->run(); 
		
		if ($this->input->is_ajax_request()) { // save data			
			return $this->load->view('ajax', array(
				'code'		=> $this->Entries_Model->save($this->input->post()), 
				'result' 	=> validation_errors() 
			));
		}
				
		$this->load->view('includes/template', array(
			'view'		=> 'includes/jForm', 
			'title'		=> 'Editar Entries',
			'form'		=> $form	  
		));		
	}

	function add(){
		$this->edit(0);
	}
	
	function _getFormProperties($entryId) {
		$data = $this->Entries_Model->get($entryId);
		
		$form = array(
			'frmId'		=> 'frmEntryEdit',
			'messages' 	=> getRulesMessages(),
			'rules'		=> array(),
			'fields'	=> array(
				'entryId' => array(
					'type'	=> 'hidden', 
					'value'	=> element('entryId', $data, 0)
				),
				'entryTitle' => array(
					'type'		=> 'text',
					'label'		=> 'Title', 
					'value'		=> element('entryTitle', $data)
				),				
				'entryUrl' => array(
					'type' 		=> 'text',
					'label'		=> 'Url', 
					'value'		=> element('entryUrl', $data)
				),
				'entryContent' => array(
					'type' 		=> 'textarea',
					'label'		=> 'Content', 
					'value'		=> element('entryContent', $data)
				),
				'entryDate' => array(
					'type' 		=> 'datetime',
					'label'		=> 'Date', 
					'value'		=> element('entryDate', $data)
				),								
			), 		
		);
		
		$form['rules'] += array( 
			array(
				'field' => 'entryTitle',
				'label' => 'Title',
				'rules' => 'required'
			),
			array(
				'field' => 'entryUrl',
				'label' => 'Url',
				'rules' => 'required'
			),
		);

		return $form;		
	}

	function getAsyncNewsEntries($userId = null) {
		exec(PHP_PATH.'  '.BASEPATH.'../index.php entries/getNewsEntries/'.(int)$userId.' > /dev/null &');
		return;
		
		
		// TODO: revisar como pedir datos para los users logeados
		// este metodo tarda casi un segundo creo; otro crontab ?
		/*$this->load->spark('curl/1.2.1'); 
		$this->curl->create(base_url().'entries/getNewsEntries/'.(int)$userId);
		$this->curl->http_login($this->input->server('PHP_AUTH_USER'), $this->input->server('PHP_AUTH_PW'));
		//$this->curl->options(array(CURLOPT_FRESH_CONNECT => 10, CURLOPT_TIMEOUT => 1));
		$this->curl->execute();*/
	}	
	
	function getNewsEntries($userId = null) {
		// scanea todos los feeds!
		$this->Entries_Model->getNewsEntries($userId);
		
		return $this->load->view('ajax', array(
			'code'		=> true,
			'result' 	=> 'ok',
		));				
	}
	
	function saveData() {
		$userId		= (int)$this->session->userdata('userId');
		$entries 	= (array)json_decode($this->input->post('entries'), true);
		$tags 		= (array)json_decode($this->input->post('tags'), true);
		
		$this->Entries_Model->saveTmpUsersEntries((int)$userId, $entries);		
		$this->Entries_Model->saveUserTags((int)$userId, $tags);
		
		return $this->load->view('ajax', array(
			'code'		=> true,
			'result' 	=> 'ok',
		));		
	}

	function addFeed() {
		$this->load->spark('ci-simplepie/1.0.1/');
		$this->cisimplepie->set_feed_url($this->input->post('feedUrl'));
		$this->cisimplepie->enable_cache(false);
		$this->cisimplepie->init();
		$this->cisimplepie->handle_content_type();
		if ($this->cisimplepie->error() != '' ) {
			return $this->load->view('ajax', array(
				'code'		=> false,
				'result' 	=> $this->cisimplepie->error(),
			));			
		}

		$userId = (int)$this->session->userdata('userId');
		$feedId = $this->Entries_Model->addFeed($userId, array('feedUrl' => $this->input->post('feedUrl')));
		$this->Entries_Model->getNewsEntries($userId, $feedId);
		$this->Entries_Model->saveEntriesTagByUser($userId);

		return $this->load->view('ajax', array(
			'code'		=> true,
			'result' 	=> array('feedId' => $feedId),
		));
	}

	function addTag() {
		$result = $this->Entries_Model->addTag($this->input->post('tagName'), $this->session->userdata('userId'), $this->input->post('feedId'));

		return $this->load->view('ajax', array(
			'code'		=> (is_array($result)),
			'result' 	=> $result,
		));
	}

	function saveUserFeedTag() {
		$result = $this->Entries_Model->saveUserFeedTag((int)$this->session->userdata('userId'), $this->input->post('feedId'), $this->input->post('tagId'), ($this->input->post('append') == 'true'));

		return $this->load->view('ajax', array(
			'code'		=> ($result === true),
			'result' 	=> ($result === true ? 'ok': $result),
		));
	}
	
	function unsubscribeFeed() {
		$result = $this->Entries_Model->unsubscribeFeed($this->input->post('feedId'), (int)$this->session->userdata('userId'));

		return $this->load->view('ajax', array(
			'code'		=> true,
			'result' 	=> 'ok',
		));
	}
	
	function markAsReadFeed() {
		$result = $this->Entries_Model->markAsReadFeed($this->input->post('feedId'), (int)$this->session->userdata('userId'));

		return $this->load->view('ajax', array(
			'code'		=> true,
			'result' 	=> 'ok',
		));
	}	
	
	function updateUserFilters() {
		$this->Entries_Model->updateUserFilters((array)json_decode($this->input->post('post')), (int)$this->session->userdata('userId'));

		return $this->load->view('ajax', array(
			'code'		=> true,
			'result' 	=> 'ok',
		));
	}	

	function migrateFromGReader() {
		$userId 	= 2; // FIXME: harckodeta
		$fileName 	= '/home/jcarle/dev/cloneReader/application/cache/subscriptions.xml';

		$xml = simplexml_load_file($fileName);

		foreach ($xml->xpath('//body/outline') as $tag) {
			if (count($tag->children()) > 0) {
				$tagName = (string)$tag['title'];

				foreach ($tag->children() as $feed) {
					
					$feed = array(
						'feedName'	=> (string)$feed->attributes()->title,
						'feedUrl' 	=> (string)$feed->attributes()->xmlUrl,
						'feedLink'	=> (string)$feed->attributes()->htmlUrl
					);
					$feedId	=  $this->Entries_Model->addFeed($userId, $feed);
					$this->Entries_Model->addTag($tagName, $userId, $feedId);
				}
			}
			else {
				$feed = array(
					'feedName' 	=> (string)$tag->attributes()->title,
					'feedUrl' 	=> (string)$tag->attributes()->xmlUrl,
					'feedLink'	=> (string)$tag->attributes()->htmlUrl
				);
				$this->Entries_Model->addFeed($userId, $feed);
			}
		}
	}
	
	function migrateStarredFromGReader() {
		$userId 	= 2; // FIXME: harckodeta
		$fileName 	= '/home/jcarle/dev/cloneReader/application/cache/starred.json';
		$json 		= (array)json_decode(file_get_contents($fileName), true);

		foreach ($json['items'] as $data) {
			$entryContent = '';
			if (element('summary', $data) != null) {
				$entryContent = $data['summary']['content'];
			}
			else if (element('content', $data) != null) {
				$entryContent = $data['content']['content'];
			}

			$entry = array(
				'entryTitle' 	=> element('title', $data, '(title unknown)'),
				'entryUrl'		=> (string)$data['alternate'][0]['href'],
				'entryAuthor'	=> element('author', $data, null),
				'entryDate'		=> date('Y-m-d H:i:s', $data['published']),
				'entryContent' 	=> (string)$entryContent,
			);

			$feed = array(
				'feedName'	=> element('title', $data['origin']),
				'feedUrl' 	=> substr($data['origin']['streamId'], 5),
				'feedLink'	=> $data['origin']['htmlUrl'],
				'feedName'	=> element('title', $data['origin'])
			);
			
			$entry['feedId']	= $this->Entries_Model->addFeed($userId, $feed);
			$entry['entryId'] 	= $this->Entries_Model->saveEntry($entry);
			
			$this->Entries_Model->saveUserEntries((int)$userId, array(array( 'userId' => $userId, 'entryId'	=> $entry['entryId'], 'starred'	=> true,  'entryRead' => true )));
		}
	}

	function buildCache($userId = null) {
		if ($userId == null) {
			$userId = (int)$this->session->userdata('userId');
		}
		
		$this->Entries_Model->saveEntriesTagByUser($userId);
		$this->getAsyncNewsEntries($userId);
	}	
	
	function populateMillionsEntries() {
		$this->Entries_Model->populateMillionsEntries();
	}
}
