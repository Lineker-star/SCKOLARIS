<?php

namespace App\Enums;

enum Role:string
{
 case STUDENT = 'student';
 case TEACHER = 'teacher';
 case ADMIN  = 'admin';

 public function label():string{
    return match($this){
        self::STUDENT => 'student',
        self::TEACHER => 'teacher',
        self::ADMIN  => 'Administrateur'
    };
 }
}