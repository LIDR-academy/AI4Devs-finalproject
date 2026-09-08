<?php

test('the login page renders without javascript errors', function () {
    $page = visit('/login');

    $page->assertSee('Log in to your account')
        ->assertSee('Enter your email and password below to log in')
        ->assertNoJavaScriptErrors();
});
