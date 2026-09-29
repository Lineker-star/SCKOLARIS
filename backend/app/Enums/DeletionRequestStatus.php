<?php

namespace App\Enums;

enum DeletionRequestStatus:string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';

    public function labels():string
    {
        return match($this){
            self::PENDING => 'pending',
            self::APPROVED => 'approved',
            self::REJECTED => 'rejected'
        };
    }
}