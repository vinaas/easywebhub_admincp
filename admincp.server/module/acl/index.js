'use strict';

const restify = require('restify');
const shiroTrie = require('shiro-trie');
const EventEmitter = require('events');
const _ = require('lodash');

// const RoleModel = require(__dirname + '/role-model.js');

class Acl extends EventEmitter {
    constructor() {
        super();
        // this.loadRole();
        // this.on('AclChanged', function () {
        //     this.loadRole();
        // });
        this.ForbiddenError = new restify.ForbiddenError();
    }

    loadRole() {
        return RoleModel.query()
            .then(entries => {
                let tmpRoleMap = {};

                // group role
                entries.forEach(entry => {
                    let role;
                    if (tmpRoleMap.hasOwnProperty[entry.role])
                        role = tmpRoleMap[entry.role];
                    else
                        role = shiroTrie.new();
                    role.add(entry.permission);

                });

                this.roleMap = tmpRoleMap;
            });
    }

    middleware() {
        const me = this;
        return function (req, res, next) {
            if (req.session == null)
                return next(me.ForbiddenError);

            var routePath = req.url;
            // remove prefix /
            if (routePath.substr(0, 1) == '/')
                routePath = routePath.substr(1);
            // remove suffix /
            if (routePath.substr(-1) == '/')
                routePath = routePath.substr(0, routePath.length - 1);

            // uncomment to protect only guard path
            //if(routePath.startsWith(me.opts['guardPath']) == false) {
            //    return next();
            //}

            routePath = routePath.replace(/\//g, ':');
            if (routePath == '') routePath = 'index.html';

            let permissionPath = `${req.method.toLowerCase()}:${routePath}`;
            //console.log('routePath', routePath, permissionPath);
            let roleName;
            // check if is guest
            if (req.state.guest) {
                roleName = 'guest';
            } else {
                // forbidden if req has no role
                if (!('state' in req) || !('user' in req.state) || !('role' in req.state.user))
                    return next(me.ForbiddenError);
                roleName = req.state.user.role;
            }

            let aclRole = me.roleMap[roleName];
            // forbidden if role not exists
            if (aclRole == undefined)
                return next(me.ForbiddenError);

            //console.log(JSON.stringify(aclRole.data, null, 4));
            // check role permission
            if (aclRole.check(permissionPath) == false)
                return next(me.ForbiddenError);

            return next();
        }
    }
}

module.exports = Acl;
