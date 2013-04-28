<?php
class Users_Model extends CI_Model {
	
	function login($userEmail, $userPassword) {
		$this->db->where('userEmail', $userEmail);
		$this->db->where('userPassword', md5($userPassword));

		return $this->db->get('users');
	}	
	
	function selectToList($num, $offset, $filter){
		$query = $this->db->select('SQL_CALC_FOUND_ROWS users.userId AS id, userEmail AS Email, CONCAT(userFirstsName, \' \', userLastName) AS Nombre, countryName AS País, GROUP_CONCAT(groups.groupName) AS Grupos ', false)
		 				->join('countries', 'users.countryId = countries.countryId')
						->join('users_groups', 'users.userId = users_groups.userId', 'left')
						->join('groups', 'groups.groupId = users_groups.groupId', 'left')
						->or_like(array('userFirstsName' => $filter, 'userLastName' => $filter))
						->group_by('users.userId')
		 				->get('users', $num, $offset);
						
		$query->foundRows = $this->Commond_Model->getFoundRows();
		return $query;
	}
	
	function search($filter, $groupId = null){
		$this->db->select('DISTINCT users.userId AS id, CONCAT(userFirstsName, \' \', userLastName) AS value  ', false)
						->join('users_groups', 'users.userId = users_groups.userId')
						->or_like(array('userFirstsName' => $filter, 'userLastName' => $filter));
		 				
		if ($groupId != null) {
			$this->db->where('groupId', $groupId);	
		}
		
		return $this->db->get('users', 50)->result_array(); // TODO: meter en una constante!
	}	
		
	function select(){
		return $this->db->get('users');
	}

	function get($userId){
		$this->db->where('userId', $userId);
		$result				= $this->db->get('users')->row_array();
		$result['groups'] 	= array_to_select($this->getGroups($userId), 'groupId', 'groupId');
		return $result;
	}	
	
	function getGroups($userId){
		return $this->db
					->where('userId', $userId)
					->get('users_groups')->result_array();
	}	
	
	function save($data){
		$userId = $data['userId'];
		
		$values = array(
			'userEmail' 		=> $data['userEmail'],
			'userFirstsName'	=> $data['userFirstsName'],
			'userLastName'		=> $data['userLastName'],
			'countryId'			=> $data['countryId']
		);
		

		if ((int)$userId != -1) {		
			$this->db->where('userId', $userId);
			$this->db->update('users', $values);
		}
		else {
			$this->db->insert('users', $values);
			$userId = $this->db->insert_id();
		}

		$this->db->where('userId', $userId)->delete('users_groups');
		if (is_array(element('groups', $data))) {
			foreach ($data['groups'] as $groupId) {
				$this->db->insert('users_groups', array('userId' => $userId, 'groupId' => $groupId));			
			}		
		}
		return true;
	}
	
	function exitsEmail($userEmail, $userId) {
		$this->db->where('userEmail', $userEmail);
		$this->db->where('userId !=', $userId);
		return ($this->db->get('users')->num_rows() > 0);		
	}

	function updateUserFiltersByUserId($userFilters, $userId) {
			$this->db->where('userId', $userId)->update('users', array('userFilters' => json_encode($userFilters)));
	}

	function getUserFiltersByUserId($userId) {
		$query = $this->db
				->select('userFilters')
				->where('userId', $userId)
				->get('users')->result_array();
		return $query[0]['userFilters'];
	}
}