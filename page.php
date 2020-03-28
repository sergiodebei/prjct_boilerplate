<?php
/**
 * The template for displaying all pages.
 */

$template = array( 'page-' . $post->post_name . '.twig', 'page.twig' );
$context = Timber::get_context();
$post = new TimberPost();
$context['post'] = $post;
$context['post']->blocks = $post->get_field('blocks');

global $paged;

if (!isset($paged) || !$paged){
    $paged = 1;
}
$args = array(
    'post_type' => 'post',
    // 'posts_per_page' => 2,
    'paged' => $paged
    // 'posts_per_page' => -1,
);

$context['posts'] = new Timber\PostQuery($args);
$context['body_class']  = 'archive'. $post->post_type;
$context['pagination'] = Timber::get_pagination();

Timber::render($template, $context);