<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AkunSimak extends Model
{
    protected $table = 'user';
    protected $connection = 'simak';
    protected $fillable = ['*'];

    public function Dosen():HasOne{
        return $this->hasOne(Dosen::class, 'NIDN', 'userid');
    }
}
