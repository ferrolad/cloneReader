<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
|
| Typically there is a one-to-one relationship between a URL string
| and its corresponding controller class/method. The segments in a
| URL normally follow this pattern:
|
|	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	http://codeigniter.com/user_guide/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES
| -------------------------------------------------------------------------
|
| There area two reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['404_override'] = 'errors/page_missing';
|
| This route will tell the Router what URI segments to use if those provided
| in the URL cannot be matched to a valid route.
|
*/

$route['default_controller']  = "home";
$route['404_override']        = 'error/error404';

$route['feedback']       = "feedbacks/addFeedback";
$route['confirmEmail']   = "profile/confirmEmail";
$route['forgotPassword'] = "profile/forgotPassword";
$route['resetPassword']  = "profile/resetPassword";


$route['contacts/(:any)/listing']       = "contacts/listing/$1";
$route['contacts/(:any)/edit/(:any)']   = "contacts/edit/$1/$2";
$route['contacts/(:any)/delete']        = "contacts/delete/$1";

$route['comments/(:any)/listing']        = "comments/listing/$1";
$route['comments/(:any)/edit/(:any)']    = "comments/edit/$1/$2";
$route['comments/(:any)/delete']         = "comments/delete/$1";
$route['comments/(:any)/popup/(:any)']   = "comments/popup/$1/$2";
$route['comments/(:any)/select/(:any)']  = "comments/select/$1/$2";

$route['tools/tags/(:any)'] = "tools/tagEdit/$1";
$route['tools/tags/add'] = "tools/tagAdd";

$route['tools/feeds/(:any)'] = "tools/feedEdit/$1";
$route['tools/feeds/add'] = "tools/feedAdd";

/* End of file routes.php */
/* Location: ./application/config/routes.php */
