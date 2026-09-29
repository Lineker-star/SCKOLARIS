<?php

namespace App\Enums;

enum AccountStatus:string
{
  case PENDING = 'pending';
  case VALIDATED = 'validated';
  case REJECTED = 'rejected';
  
  public function labels():string{
    return match($this) {
        self::PENDING => 'pending',
        self::VALIDATED => 'validated',
        self::REJECTED => 'rejected'
    };
  }
}